import clsx from "clsx";

interface Props {
  state: string;
}

export default function ProjectDetailVMPowerBadge({ state }: Props) {
  const map: Record<string, string> = {
    ON: "bg-green-100 text-green-700",
    OFF: "bg-gray-100 text-gray-500",
    PAUSED: "bg-yellow-100 text-yellow-700",
    UNKNOWN: "bg-red-100 text-red-500",
  };
  const dots: Record<string, string> = {
    ON: "bg-green-500",
    OFF: "bg-gray-400",
    PAUSED: "bg-yellow-500",
    UNKNOWN: "bg-red-400",
  };

  return (
    <span
      className={clsx(
        "flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        map[state] ?? "bg-gray-100 text-gray-500",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          dots[state] ?? "bg-gray-400",
        )}
      />
      {state}
    </span>
  );
}
