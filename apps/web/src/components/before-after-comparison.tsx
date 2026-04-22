'use client';

import { useState } from 'react';

export function BeforeAfterComparison({
  beforeSrc,
  afterSrc,
  alt,
}: {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
}) {
  const [slider, setSlider] = useState(50);

  return (
    <div className="comparison-shell">
      <div className="comparison-frame">
        <div className="comparison-base">
          <img src={beforeSrc} alt={`${alt} before enhancement`} />
        </div>
        <div className="comparison-overlay" style={{ width: `${slider}%` }}>
          <img src={afterSrc} alt={`${alt} after enhancement`} />
        </div>
      </div>
      <div className="range-wrap">
        <input
          aria-label="Before after slider"
          type="range"
          min={0}
          max={100}
          value={slider}
          onChange={(event) => setSlider(Number(event.target.value))}
        />
        <div className="range-labels">
          <span>Before</span>
          <span>{slider}%</span>
          <span>After</span>
        </div>
      </div>
    </div>
  );
}
