import React from "react";
import { Typography } from "antd";
const { Text } = Typography;

const EllipsisMiddle: React.FC<{ suffixCount: number; children: string }> = ({
  suffixCount,
  children,
}) => {
  const start = children.slice(0, children.length - suffixCount).trim();
  const suffix = children.slice(-suffixCount).trim();
  const showEllipsis = children.length > suffixCount;

  if (showEllipsis) {
    return (
      <Text style={{ maxWidth: "100%" }} ellipsis={{ suffix }}>
        {start}
      </Text>
    );
  } else {
    return <Text style={{ maxWidth: "100%" }}>{children}</Text>;
  }
};

export default EllipsisMiddle;