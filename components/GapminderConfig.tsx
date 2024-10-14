const google_trend_config = {
  title: "谷歌趋势",
  x_title: "总热度",
  filter(d) {
    return d.value > 1;
  },
  get_scale(v, data) {
    return 100;
  },
  _data(data) {
    const ret = [];
    if (this.info) {
      data.push(this.info);
    }
    const da = data.slice(0, -1).map((t) => ({ ...t.data, names: t.names }));
    const info = data.at(-1);
    const scales = data.map((d, i) => [i, d.scale_stage]).filter((d) => d[1]);
    for (const d of da) {
      const names = d.names;
      delete d.names;
      for (const search_code in d) {
        if (!(search_code.startsWith("/m") || search_code.startsWith("/g"))) {
          continue;
        }
        const r = ret.find((t) => t.name === search_code);
        if (r === undefined) {
          const name = names[search_code];
          let reg = name.match(/[\u4e00-\u9fa5]+/);
          if (!reg) {
            reg = name.match(/[^(]+/);
          }
          const na = reg[0].trim();
          const info_name = info[name];
          if (!info_name) {
            continue;
          }
          const d_ind = da.indexOf(d);
          const scale = scales.reduce(
            (ac, t) => (t[0] > d_ind ? ac * t[1] : ac),
            1
          );
          const scale_data = Object.keys(d[search_code]).reduce((acc, t) => {
            const tt = d[search_code][t];
            return { ...acc, [t.split(" ")[0]]: Math.round(tt * scale) };
          }, {});
          ret.push({
            name: na,
            color:
              parseInt(info_name / 10) * 10 ||
              this.occupation?.info_name ||
              info_name,
            data: scale_data,
          });
        }
      }
    }
    return ret;
  },
  _dates(data, parseTime) {
    const dates = Object.keys(data[0].data).map((x) =>
      x.includes(" ") ? parseTime(x.split(" ")[0]) : x
    );
    return dates;
  },
  get_current(data, date, delay_parameter, bisectDate, valueAt, d3) {
    const format = d3.timeFormat("%Y-%m-%d");
    const s_date = date instanceof Date ? format(date) : date;
    const current = data.map((d) => {
      const prev = Object.keys(d.data)
        .filter((t) => t <= s_date)
        .sort()
        .map((k) => d.data[k]);
      while (prev[0] === 0) {
        prev.shift();
      }
      const value = prev.reduce((acc, t) => acc + t, 0);
      let y = d.data[s_date];
      if (y === 0) {
        // if (prev.length > 0) {
        //         y = value / prev.length
        // } else {
        //         y = 1
        // }
        y = 1;
      }
      return { ...d, value, y, r_value: y };
    });
    return current;
  },
  _max_y(d3, dataAt, data) {
    return 100;
  },
  _min_y(d3, dataAt) {
    return 1;
  },
  format_slider(v) {
    return `search interest`;
  },
};
const GapminderConfig = {
  name: "gapminder MusicGroup",
  legend_title: "",
  data_address: "groups100_2004-01-01_2023-05-09_trend",
  get_colors(data) {
    const occupation = [
      ...new Set(Object.values(this.occupation || this.info)),
    ];
    return occupation;
  },
  info: {
    五月天: "摇滚",
    BLACKPINK: "流行",
    Vicetone: "电子",
    "TWICE (트와이스)": "流行",
    "The Chainsmokers": "流行",
    "F.I.R.飞儿乐团": "摇滚",
    "Maroon 5 (魔力红)": "摇滚",
    TFBOYS: "流行",
    苏打绿: "华语流行",
    动力火车: "华语流行",
    "T-ara (티아라)": "流行",
    "Westlife (西城男孩)": "流行",
    水木年华: "摇滚",
    筷子兄弟: "华语流行",
    "Linkin Park (林肯公园)": "摇滚",
    南拳妈妈: "摇滚",
    "Red Velvet (레드벨벳)": "流行",
    "Fall Out Boy": "摇滚",
    "MAMAMOO (마마무)": "流行",
    飞轮海: "华语流行",
    新裤子: "华语流行",
    BY2: "流行",
    "少女时代 (소녀시대)": "流行",
    "Coldplay (酷玩乐队)": "流行",
    "Owl City (猫头鹰之城)": "电子",
    "Clean Bandit (清洁盗贼)": "流行",
    "Groove Coverage (舞动精灵乐团)": "流行",
    "SEVENTEEN (세븐틴)": "流行",
    "WINNER (위너)": "流行",
    Soler: "流行",
    "Davichi (다비치)": "流行",
    R1SE: "流行",
    "AKMU (악동뮤지션)": "流行",
    "Backstreet Boys (后街男孩)": "流行",
    "SISTAR (씨스타)": "流行",
    "f(x) (에프엑스)": "流行",
    火箭少女101: "流行",
    "Nightwish (夜愿)": "摇滚",
    羽泉: "摇滚",
    "NCT 127 (엔시티 127)": "流行",
    青蛙乐队: "华语流行",
    "The Script (手稿乐队)": "流行",
    TF家族: "华语流行",
    "M2M (窈窕美眉)": "华语流行",
    "The Glitch Mob": "电子",
    "Carpenters (卡朋特乐队)": "摇滚",
    "OH MY GIRL (오마이걸)": "流行",
    "SUPER JUNIOR (슈퍼주니어)": "流行",
    "Ashes Remain": "摇滚",
    "生物股长 (いきものがかり)": "流行",
    "Epik High (에픽하이)": "摇滚",
    "Little Mix": "流行",
  },
  vid: "0114NhRr2DPvQX",
  opacity: 0.1,
  ...google_trend_config,
};
export default GapminderConfig;
