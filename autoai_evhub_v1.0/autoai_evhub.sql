CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  system_type TEXT,
  battery_capacity_kwh NUMERIC,
  voltage_system NUMERIC,
  coolant_type TEXT,
  isolation_monitor TEXT,
  inverter TEXT,
  dc_dc_converter TEXT,
  hv_service_disconnect TEXT,
  notes TEXT
);

CREATE TABLE components (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT,
  manufacturer TEXT,
  part_number TEXT,
  location TEXT,
  notes TEXT
);

CREATE TABLE faults (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
  dtc_code TEXT,
  description TEXT,
  severity TEXT,
  procedure TEXT
);

-- sample data
INSERT INTO vehicles (make, model, year, system_type, battery_capacity_kwh, voltage_system, notes)
VALUES
('Toyota', 'Prius Prime', 2023, 'PHEV', 13.6, 355, 'Li-ion 95s2p pack'),
('Hyundai', 'Ioniq 5', 2022, 'EV', 72.6, 697, '800V architecture'),
('Tesla', 'Model 3', 2023, 'EV', 82.0, 400, 'NCA cells, Gen4 inverter'),
('BMW', 'i4 eDrive40', 2023, 'EV', 83.9, 400, 'Gen5 eDrive rear motor'),
('Renault', 'Megane E-Tech', 2023, 'EV', 60.0, 400, 'Battery underfloor cooling');

INSERT INTO components (vehicle_id, type, manufacturer, location, notes)
VALUES
(2, 'Inverter', 'Siemens', 'Front RH bay', 'Water-cooled'),
(3, 'DC-DC Converter', 'Tesla', 'Front trunk', 'Integrated with charger');

INSERT INTO faults (vehicle_id, dtc_code, description, severity, procedure)
VALUES
(1, 'P0A94', 'DC/DC Converter Performance', 'High', 'Check inverter cooling pump and HV fuse IGCT1'),
(2, 'P1A10', 'Isolation Resistance Low', 'High', 'Measure pack-to-chassis resistance and inspect OBC seals'),
(3, 'P0A0F', 'HV System Interlock Open', 'Medium', 'Check service disconnect and rear contactors'),
(4, 'P1C77', 'Inverter Overtemperature', 'High', 'Inspect coolant loop and inverter pump control'),
(5, 'P1A73', 'Battery Cooling System Malfunction', 'Medium', 'Pressure-test coolant circuit, verify valve actuator');
