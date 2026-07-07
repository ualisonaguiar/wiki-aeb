import { AppError } from "../../shared/http/errors.js";
import * as repository from "./inventario.vm.repository.js";
import type {
  CreateInventarioVmInput,
  InventarioVm,
  UpdateInventarioVmInput,
} from "./inventario.vm.types.js";

export async function listInventarioVms(): Promise<InventarioVm[]> {
  return repository.listInventarioVms();
}

export async function getInventarioVm(id: number): Promise<InventarioVm> {
  const vm = await repository.findInventarioVmById(id);

  if (!vm) {
    throw new AppError(404, "Host nao encontrado", "HOST_NOT_FOUND");
  }

  return vm;
}

export async function createInventarioVm(
  input: CreateInventarioVmInput,
): Promise<InventarioVm> {
  try {
    return await repository.createInventarioVm(input);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Já existe um host cadastrado com este nome")
    ) {
      throw new AppError(409, "Host duplicado", "HOST_DUPLICATE");
    }

    throw error;
  }
}

export async function updateInventarioVm(
  id: number,
  input: UpdateInventarioVmInput,
): Promise<InventarioVm> {
  const updated = await repository.updateInventarioVm(id, input);

  if (!updated) {
    throw new AppError(404, "Host nao encontrado", "HOST_NOT_FOUND");
  }

  return updated;
}

export async function deleteInventarioVm(id: number): Promise<void> {
  const deleted = await repository.deleteInventarioVm(id);

  if (!deleted) {
    throw new AppError(404, "Host nao encontrado", "HOST_NOT_FOUND");
  }
}

export async function getAplicacoesByVm(vmName: string) {
  return repository.listAplicacoesByVm(vmName);
}
