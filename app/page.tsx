// app/page.tsx (หรือ app/map/page.tsx ก็ได้)
import { getProvinceStats } from "./lib/dataset";
import ThailandChoropleth from "./components/ThailandChoropleth";

export default async function HomePage() {
  const provinceStats = await getProvinceStats();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        backgroundColor: "#f3f4f6",
      }}
    >
      <ThailandChoropleth data={provinceStats} />
    </main>
  );
}
