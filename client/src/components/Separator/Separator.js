import "./Separator.css"

export function Separator({direction = "vertical", color}) {
    return (
        <div className={
            `separator ${direction}`
        } style={{
            "--separator-color": color || "var(--color-text)"
        }}></div>
    )
}