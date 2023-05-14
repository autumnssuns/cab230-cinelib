import "./CardSpinner.css";

/**
 * A spinner that is used in the card component.
 * @param size The size of the spinner.
 * @returns The spinner component.
 */
export default function CardSpinner({ size }) {
  return (
    <div
      className="spinner"
      style={{
        "--size": size,
      }}
    >
      <span></span>
    </div>
  );
}
