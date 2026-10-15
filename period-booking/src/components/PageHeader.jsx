import React from "react";

export default function PageHeader({ kicker, title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {children && <div className="header-actions">{children}</div>}
    </div>
  );
}
