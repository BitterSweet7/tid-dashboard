// app/components/StatCard.tsx

type StatCardProps = {
  label: string;
  value: number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "16px 24px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        backgroundColor: "#ffffff",
        minWidth: "220px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 600 }}>
        {value.toLocaleString("en-US")}
      </div>
    </div>
  );
}
