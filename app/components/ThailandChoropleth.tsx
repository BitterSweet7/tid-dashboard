"use client";

import React, { useEffect } from "react";
import * as d3 from "d3";
const topojson: any = require("topojson-client");

export type ProvinceStats = {
  Province_ENG: string;
  thaiTourists: number;
  foreignTourists: number;
  totalIncome: number;
};

type Props = {
  data: ProvinceStats[];
};

export default function ThailandChoropleth({ data }: Props) {
  useEffect(() => {
    const container = d3.select("#th-map");
    container.selectAll("*").remove(); // ล้างของเก่า

    const width = 800;
    const height = 600;

    container.style("position", "relative"); // ให้ tooltip วางซ้อนบนแผนที่ได้

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    // ---------- 1) สร้าง tooltip ----------
    const tooltip = container
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("opacity", 0);

      
    // ---------- 2) เตรียมข้อมูล ----------
    const valuemap = new Map<string, ProvinceStats>(
      data.map((d) => [d.Province_ENG, d])
      
    );
    console.log("stats data sample:", data.slice(0, 5));
      console.log("stats province names:", data.map(d => d.Province_ENG));
    // ใช้ "จำนวนนักท่องเที่ยวรวม" เป็นตัววัดสี
    const totals = data.map((d) => d.thaiTourists + d.foreignTourists);
    const minTotal = d3.min(totals) ?? 0;
    const maxTotal = d3.max(totals) ?? 1;

    // ---------- 3) สร้าง scale สี ----------
    // ยิ่งคนเยอะ → สีฟ้าเข้มขึ้น
    const color = d3
      .scaleSequential<number>()               // << เปลี่ยนมาใช้ sequential
      .domain([minTotal, maxTotal])           // << domain = จำนวนคนรวม
      .interpolator(d3.interpolateBlues);     // << โทนฟ้าจากอ่อน→เข้ม

    // ---------- 4) โหลด topojson ----------
    d3.json("/thailand-provinces.topojson").then((topology: any) => {
      const objectName = "province"; // จากไฟล์ที่เช็คให้: objects.province

      const provinces = topojson.feature(
        topology,
        topology.objects[objectName]
      ) as any;

      const projection = d3
        .geoMercator()
        .fitSize([width, height], provinces);

      const path = d3.geoPath().projection(projection);

      // ---------- 5) วาดแผนที่ + ตั้งสี + hover ----------
      svg
        .append("g")
        .selectAll("path")
        .data(provinces.features)
        .join("path")
        .attr("d", path as any)
        .attr("fill", (d: any) => {
          const name = d.properties.NAME_1 as string; // จังหวัดใน topojson
          const stats = valuemap.get(name);
          if (!stats) return "#eee"; // ไม่มีข้อมูล → เทาอ่อน

          const totalTourists = stats.thaiTourists + stats.foreignTourists;
          return color(totalTourists); // ยิ่งมาก → ยิ่งเข้ม
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        
        .on("mousemove", function (event: MouseEvent, d: any) {
        const name = d.properties.NAME_1 as string;
        const stats = valuemap.get(name);

        const [x, y] = d3.pointer(event, container.node() as any);

        console.log("hover province:", name, "hasStats:", !!stats);

        // ถ้ายังไม่มี stats ก็โชว์แค่ชื่อจังหวัดไปก่อน
        if (!stats) {
            tooltip
            .style("opacity", 1)
            .style("left", x + 12 + "px")
            .style("top", y + 12 + "px")
            .html(`<div><strong>${name}</strong></div><div>No data</div>`);
            return;
        }

        const totalTourists = stats.thaiTourists + stats.foreignTourists;

        tooltip
            .style("opacity", 1)
            .style("left", x + 12 + "px")
            .style("top", y + 12 + "px")
            .html(`
            <div><strong>${name}</strong></div>
            <div>Thai tourists: ${stats.thaiTourists.toLocaleString()}</div>
            <div>Foreign tourists: ${stats.foreignTourists.toLocaleString()}</div>
            <div>Total tourists: ${totalTourists.toLocaleString()}</div>
            <div>Total income: ${stats.totalIncome.toLocaleString()} M Baht</div>
            `);
        })
        .on("mouseleave", () => {
        tooltip.style("opacity", 0);
        });
    });
  }, [data]);

  return <div id="th-map" />;
}
