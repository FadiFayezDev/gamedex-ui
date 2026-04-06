import { z } from "zod"

import { Company } from "@/components/models/ecosystem/Company"
import { CompanySchema } from "@/lib/schemas/company"
import { request } from "@/lib/services/http"
import { ApiRoot } from "@/components/root/root"

const ApiCompanySchema = z
  .object({
    id: z.coerce.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough()

const ApiCompanyListSchema = z.union([
  z.array(ApiCompanySchema),
  z.object({ items: z.array(ApiCompanySchema) }),
])

const ApiCompanyListResponse = ApiCompanyListSchema.nullable()
const ApiCompanyResponse = ApiCompanySchema.nullable()
const EmptyResponseSchema = z.unknown().nullable()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const toCompany = (apiCompany: z.infer<typeof ApiCompanySchema>): Company =>
  CompanySchema.parse({
    id:
      apiCompany.id ??
      slugify(apiCompany.name ?? apiCompany.title ?? "company"),
    name: apiCompany.name ?? apiCompany.title ?? "Unknown",
  })

export async function listCompanies() {
  const data = await request(
    `${ApiRoot}/api/v1/companies`,
    { method: "GET" },
    ApiCompanyListResponse
  )
  if (!data) return []
  const list = Array.isArray(data) ? data : data.items
  return list.map((item) => toCompany(item))
}

export type CreateCompanyRequest = { name?: string }

export async function createCompany(input: CreateCompanyRequest) {
  const data = await request(
    `${ApiRoot}/api/v1/companies`,
    { method: "POST", body: input },
    ApiCompanyResponse
  )
  return data ? toCompany(data) : null
}

export async function getCompany(id: string) {
  const data = await request(
    `${ApiRoot}/api/v1/companies/${id}`,
    { method: "GET" },
    ApiCompanyResponse
  )
  return data ? toCompany(data) : null
}

export type UpdateCompanyNameRequest = { newName?: string }

export async function updateCompanyName(
  id: string,
  input: UpdateCompanyNameRequest
) {
  await request(
    `${ApiRoot}/api/v1/companies/${id}`,
    { method: "PUT", body: input },
    EmptyResponseSchema
  )
}

export async function deleteCompany(id: string) {
  await request(
    `${ApiRoot}/api/v1/companies/${id}`,
    { method: "DELETE" },
    EmptyResponseSchema
  )
}