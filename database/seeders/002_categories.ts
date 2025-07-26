import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("categories").del();

  // Inserts seed entries
  await knex("categories").insert([
    {
      id: 1,
      name: "Network Equipment",
      description: "Router, Switch, Access Point, dan perangkat jaringan lainnya",
      code: "NET",
      is_active: true
    },
    {
      id: 2,
      name: "Cable & Connector",
      description: "Kabel fiber optic, UTP, connector, dan aksesoris kabel",
      code: "CABLE",
      is_active: true
    },
    {
      id: 3,
      name: "Server & Storage",
      description: "Server, storage, dan komponen data center",
      code: "SERVER",
      is_active: true
    },
    {
      id: 4,
      name: "Tools & Instrument",
      description: "Alat ukur, crimping tool, dan peralatan teknisi",
      code: "TOOLS",
      is_active: true
    },
    {
      id: 5,
      name: "Power & UPS",
      description: "UPS, power supply, dan perangkat power management",
      code: "POWER",
      is_active: true
    },
    {
      id: 6,
      name: "Optical Equipment",
      description: "OLT, ONT, ONU, splitter, dan perangkat fiber optic",
      code: "OPTICAL",
      is_active: true
    },
    {
      id: 7,
      name: "Installation Material",
      description: "Tiang, bracket, duct, dan material instalasi",
      code: "INSTALL",
      is_active: true
    },
    {
      id: 8,
      name: "Spare Parts",
      description: "Komponen dan spare part untuk maintenance",
      code: "SPARE",
      is_active: true
    }
  ]);

  // Reset sequence
  await knex.raw('ALTER SEQUENCE categories_id_seq RESTART WITH 9');
}
