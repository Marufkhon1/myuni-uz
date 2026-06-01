import { useMemo } from "react";
import FilterSelect from "./FilterSelect.jsx";

export default function FilterField(props) {
  const { label, value, onChange, children, icon, className, disabled } = props;

  const options = useMemo(() => {
    const items = [];
    if (!children) {
      return items;
    }

    for (const child of Array.isArray(children) ? children : [children]) {
      if (!child?.props) {
        continue;
      }
      items.push({
        value: child.props.value ?? "",
        label: child.props.children,
      });
    }
    return items;
  }, [children]);

  return (
    <FilterSelect
      label={label}
      icon={icon}
      value={value}
      onChange={(nextValue) => onChange?.({ target: { value: nextValue } })}
      options={options}
      className={className}
      disabled={disabled}
    />
  );
}
