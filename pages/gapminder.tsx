import { useState, useEffect } from "react";
import GapminderChart from "../components/GapminderChart";
import GapminderConfig from "../components/GapminderConfig";
export default function Home() {
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Fetch data and config here
    // For example:
    fetch(
      "http://localhost:8010/get_file?address=~/Documents/data/resource/groups100_2004-01-01_2023-05-09_trend"
    )
      .then((res) => res.json())
      .then((data) => {
        setData(GapminderConfig._data(data));
      });
    setConfig(GapminderConfig);
  }, []);

  if (!data || !config) return <div>Loading...</div>;

  return (
    <div>
      <h1>Gapminder Chart</h1>
      <GapminderChart data={data} config={config} />
    </div>
  );
}
