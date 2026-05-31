import { useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { EyeOutlined, DownloadOutlined, FileSearchOutlined } from "@ant-design/icons";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const statusColors = {
  SUCCESS: "green",
  FAILED: "red",
  PROCESSING: "gold",
};

const mockRows = Array.from({ length: 28 }).map((_, idx) => {
  const statuses = ["SUCCESS", "FAILED", "PROCESSING"];
  const status = statuses[idx % 3];
  const original = 900 + idx * 27;
  const summary = Math.floor(original * 0.28);
  return {
    key: idx + 1,
    stt: idx + 1,
    userName: `user_${idx + 1}`,
    email: `user${idx + 1}@mail.com`,
    documentName: `Tai_lieu_bao_cao_${idx + 1}.pdf`,
    fileType: "PDF",
    model: idx % 2 === 0 ? "claude-sonnet-4-6" : "claude-opus-4-8",
    originalLength: original,
    summaryLength: summary,
    duration: `${(2 + (idx % 9) * 0.7).toFixed(1)}s`,
    createdAt: `2026-05-${String((idx % 30) + 1).padStart(2, "0")} 10:${String((idx * 3) % 60).padStart(2, "0")}`,
    status,
    summaryContent: `Day la noi dung tom tat #${idx + 1}. He thong da rut gon van ban va giu lai cac y chinh quan trong de quan tri vien xem nhanh ket qua xu ly AI.`,
  };
});

const lineDataMap = {
  "7d": [
    { label: "T2", value: 108 },
    { label: "T3", value: 126 },
    { label: "T4", value: 119 },
    { label: "T5", value: 143 },
    { label: "T6", value: 160 },
    { label: "T7", value: 132 },
    { label: "CN", value: 118 },
  ],
  "30d": Array.from({ length: 30 }).map((_, i) => ({ label: `${i + 1}`, value: 80 + ((i * 13) % 95) })),
  "12m": [
    { label: "T1", value: 2100 },
    { label: "T2", value: 2260 },
    { label: "T3", value: 2390 },
    { label: "T4", value: 2480 },
    { label: "T5", value: 2600 },
    { label: "T6", value: 2540 },
    { label: "T7", value: 2720 },
    { label: "T8", value: 2850 },
    { label: "T9", value: 2930 },
    { label: "T10", value: 3010 },
    { label: "T11", value: 3150 },
    { label: "T12", value: 3280 },
  ],
};

const pieData = [
  { name: "Thành công", value: 84, color: "#16a34a" },
  { name: "Thất bại", value: 9, color: "#dc2626" },
  { name: "Đang xử lý", value: 7, color: "#f59e0b" },
];

export default function SummaryHistoryManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lineRange, setLineRange] = useState("7d");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [detailRow, setDetailRow] = useState(null);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return mockRows.filter((row) => {
      const passSearch =
        !keyword ||
        row.documentName.toLowerCase().includes(keyword) ||
        row.userName.toLowerCase().includes(keyword);
      const passStatus = statusFilter === "ALL" || row.status === statusFilter;
      return passSearch && passStatus;
    });
  }, [search, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const columns = [
    { title: "STT", dataIndex: "stt", key: "stt", width: 70 },
    { title: "Người dùng", dataIndex: "userName", key: "userName", width: 140 },
    { title: "Tài liệu", dataIndex: "documentName", key: "documentName", ellipsis: true },
    { title: "Độ dài gốc", dataIndex: "originalLength", key: "originalLength", width: 120 },
    { title: "Độ dài tóm tắt", dataIndex: "summaryLength", key: "summaryLength", width: 140 },
    { title: "Thời gian xử lý", dataIndex: "duration", key: "duration", width: 130 },
    { title: "Thời gian tạo", dataIndex: "createdAt", key: "createdAt", width: 170 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const label = status === "SUCCESS" ? "Thành công" : status === "FAILED" ? "Thất bại" : "Đang xử lý";
        return <Tag color={statusColors[status]}>{label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      render: (_, row) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => setDetailRow(row)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Space wrap size={12} style={{ width: "100%" }}>
          <Input
            allowClear
            placeholder="Tìm kiếm tài liệu hoặc người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />
          <RangePicker />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "Tất cả trạng thái" },
              { value: "SUCCESS", label: "Thành công" },
              { value: "FAILED", label: "Thất bại" },
              { value: "PROCESSING", label: "Đang xử lý" },
            ]}
            style={{ width: 180 }}
          />
          <Button type="primary" icon={<DownloadOutlined />}>Xuất Excel</Button>
        </Space>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tổng lượt tóm tắt", "18,540", "+12.4% so với kỳ trước"],
          ["Lượt tóm tắt hôm nay", "312", "+18.9% so với hôm qua"],
          ["Tỷ lệ thành công", "92.0%", "+1.6% theo tuần"],
          ["Thời gian xử lý trung bình", "12.4s", "-8.0% so với tháng trước"],
        ].map(([title, value, sub]) => (
          <Card key={title} className="rounded-2xl" styles={{ body: { padding: 18 } }}>
            <Text type="secondary">{title}</Text>
            <Title level={2} style={{ margin: "8px 0" }}>{value}</Title>
            <Text type="secondary">{sub}</Text>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl" title="Lượt tóm tắt theo thời gian" extra={(
          <Select value={lineRange} onChange={setLineRange} style={{ width: 120 }} options={[
            { value: "7d", label: "7 ngày" },
            { value: "30d", label: "30 ngày" },
            { value: "12m", label: "12 tháng" },
          ]} />
        )}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineDataMap[lineRange]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl" title="Phân bố trạng thái xử lý">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl" title="Bảng lịch sử tóm tắt">
        <Table
          columns={columns}
          dataSource={pagedRows}
          pagination={false}
          scroll={{ x: 1200 }}
          rowKey="key"
        />
        <div className="mt-4 flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filteredRows.length}
            showSizeChanger
            onChange={(p, size) => {
              setPage(p);
              setPageSize(size);
            }}
          />
        </div>
      </Card>

      <Drawer
        title="Chi tiết lần tóm tắt"
        open={Boolean(detailRow)}
        width={500}
        onClose={() => setDetailRow(null)}
        extra={<Button onClick={() => setDetailRow(null)}>Đóng</Button>}
      >
        {detailRow && (
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <Card size="small" title="Thông tin chung">
              <p><b>Tên người dùng:</b> {detailRow.userName}</p>
              <p><b>Email:</b> {detailRow.email}</p>
              <p><b>Tài liệu:</b> {detailRow.documentName}</p>
              <p><b>Loại file:</b> {detailRow.fileType}</p>
              <p><b>Model AI:</b> {detailRow.model}</p>
              <p><b>Thời gian xử lý:</b> {detailRow.duration}</p>
              <p><b>Thời gian tạo:</b> {detailRow.createdAt}</p>
            </Card>
            <Card size="small" title="Thông tin thống kê">
              <p><b>Số từ văn bản gốc:</b> {detailRow.originalLength}</p>
              <p><b>Số từ bản tóm tắt:</b> {detailRow.summaryLength}</p>
              <p><b>Tỷ lệ rút gọn:</b> {Math.round((1 - detailRow.summaryLength / detailRow.originalLength) * 100)}%</p>
            </Card>
            <Card size="small" title="Nội dung tóm tắt">
              <div className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 p-3">
                {detailRow.summaryContent}
              </div>
            </Card>
            <Space>
              <Button type="default" icon={<FileSearchOutlined />}>Xem tài liệu gốc</Button>
              <Button type="primary" onClick={() => setDetailRow(null)}>Đóng</Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </section>
  );
}
