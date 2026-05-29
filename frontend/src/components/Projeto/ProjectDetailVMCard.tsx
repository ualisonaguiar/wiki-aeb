import { Server, Cpu, MemoryStick, HardDrive, Wifi } from "lucide-react";
import type { InfraVM } from "../../hooks/useInfra";
import VMPowerBadge from "./ProjectDetailVMPowerBadge";
import VMStat from "./ProjectDetailVMStat";

interface Props {
  vm: InfraVM;
}

export default function ProjectDetailVMCard({ vm }: Props) {
  const memLabel =
    vm.memorySizeMb >= 1024
      ? `${vm.memorySizeMb / 1024} GB`
      : `${vm.memorySizeMb} MB`;

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-mono text-sm font-semibold text-gray-800">
          {vm.name}
        </p>
        <VMPowerBadge state={vm.powerState} />
      </div>
      {vm.hostName && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Server size={11} /> {vm.hostName}
        </p>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <VMStat
          icon={<Cpu size={11} />}
          label="vCPU"
          value={String(vm.numVcpus * vm.numCores)}
        />
        <VMStat icon={<MemoryStick size={11} />} label="RAM" value={memLabel} />
        <VMStat
          icon={<HardDrive size={11} />}
          label="Disco"
          value={`${vm.diskSizeGb} GB`}
        />
      </div>
      {vm.ipAddresses.length > 0 && (
        <p className="mt-2 flex items-center gap-1 font-mono text-xs text-gray-400">
          <Wifi size={11} /> {vm.ipAddresses.join(", ")}
        </p>
      )}
    </div>
  );
}
