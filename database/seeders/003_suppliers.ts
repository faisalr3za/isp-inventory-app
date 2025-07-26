import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("suppliers").del();

  // Inserts seed entries
  await knex("suppliers").insert([
    {
      id: 1,
      name: "PT Cisco Systems Indonesia",
      code: "CISCO",
      contact_person: "John Doe",
      phone: "+62-21-12345678",
      email: "sales@cisco.co.id",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      postal_code: "12345",
      is_active: true
    },
    {
      id: 2,
      name: "PT Huawei Technologies",
      code: "HUAWEI",
      contact_person: "Jane Smith",
      phone: "+62-21-87654321",
      email: "enterprise@huawei.com",
      address: "Jl. Rasuna Said No. 456",
      city: "Jakarta",
      postal_code: "12950",
      is_active: true
    },
    {
      id: 3,
      name: "PT Mikrotik Indonesia",
      code: "MIKROTIK",
      contact_person: "Ahmad Suharto",
      phone: "+62-21-55667788",
      email: "sales@mikrotik.co.id",
      address: "Jl. Gatot Subroto No. 789",
      city: "Jakarta",
      postal_code: "12870",
      is_active: true
    },
    {
      id: 4,
      name: "PT Ubiquiti Networks Indonesia",
      code: "UBNT",
      contact_person: "Budi Santoso",
      phone: "+62-21-99887766",
      email: "info@ubnt.co.id",
      address: "Jl. HR Rasuna Said No. 321",
      city: "Jakarta",
      postal_code: "12940",
      is_active: true
    },
    {
      id: 5,
      name: "PT Fiberhome Technologies",
      code: "FIBERHOME",
      contact_person: "Siti Nurhaliza",
      phone: "+62-21-44556677",
      email: "sales@fiberhome.co.id",
      address: "Jl. Kuningan No. 654",
      city: "Jakarta",
      postal_code: "12920",
      is_active: true
    },
    {
      id: 6,
      name: "PT TP-Link Indonesia",
      code: "TPLINK",
      contact_person: "Andi Wijaya",
      phone: "+62-21-33445566",
      email: "business@tp-link.com",
      address: "Jl. Casablanca No. 987",
      city: "Jakarta",
      postal_code: "12870",
      is_active: true
    },
    {
      id: 7,
      name: "PT Telkom Akses",
      code: "TELKOMAKSES",
      contact_person: "Dewi Sartika",
      phone: "+62-21-22334455",
      email: "procurement@telkomakses.co.id",
      address: "Jl. Japati No. 1",
      city: "Bandung",
      postal_code: "40133",
      is_active: true
    },
    {
      id: 8,
      name: "PT ZTE Indonesia",
      code: "ZTE",
      contact_person: "Li Ming",
      phone: "+62-21-77889900",
      email: "sales@zte.co.id",
      address: "Jl. Mega Kuningan No. 111",
      city: "Jakarta",
      postal_code: "12950",
      is_active: true
    }
  ]);

  // Reset sequence
  await knex.raw('ALTER SEQUENCE suppliers_id_seq RESTART WITH 9');
}
