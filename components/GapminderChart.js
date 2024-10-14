import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GapminderChart = ({ data, config }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && config) {
      createChart();
    }
  }, [data, config]);

  const createChart = () => {
    // Clear any existing SVG
    d3.select(chartRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 20, right: 35, bottom: 35, left: 66 };

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    // Set up scales
    function _params(data, d3) {
      let xmin, xmax, ymin, ymax;
      if (config.max_min) {
        ({ xmin, xmax, ymin, ymax } = config.max_min);
      } else {
        const da = data.map((t) => Object.values(t.data));
        const d = da.flat();
        const ss = da.map((it) => it.reduce((acc, t) => acc + t, 0));
        [xmin, xmax] = d3.extent([0, ...ss]);
        [ymin, ymax] = d3.extent(d);
      }
      return {
        margin: { top: 20, right: 35, bottom: 35, left: 66 },
        xmin,
        xmax,
        ymin,
        ymax,
      };
    }
    const params = _params(data, d3);
    config.params = params
    const x = d3.scaleLinear()
      .domain([config.params.xmin, config.params.xmax])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLog()
      .domain([config.params.ymin || 1, config.params.ymax])
      .range([height - margin.bottom, margin.top]);

    // Add axes
    const xAxis = (g) => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80, ","))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", width)
        .attr("y", -4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(config.x_label || "Total search interest →"));

    const yAxis = (g) => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(height / 80, ","))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", 4)
        .attr("y", margin.top)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Realtime Interests"));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    // Add circles for data points
    const circles = svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.value))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", d => d.color);

    // Add labels if needed
    // ...

    // Add any additional chart elements as per the original code
    // ...

  };

  return <div ref={chartRef}></div>;
};

export default GapminderChart;