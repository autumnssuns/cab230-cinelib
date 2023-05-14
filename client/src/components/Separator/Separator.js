import "./Separator.css";

/**
 * A separator component that is a one-pixel line.
 * @param direction The direction of the separator. Default is vertical.
 * @param color The color of the separator. Default is var(--color-text).
 * @returns The separator component.
 */
export function Separator({ direction = "vertical", color }) {
  return (
    <div
      className={`separator ${direction}`}
      style={{
        "--separator-color": color || "var(--color-text)",
      }}
    ></div>
  );
}
