"use client";

import Panel, { PanelCard, Ticks } from "./Panel";
import LiveDemo from "./LiveDemo";

/* Panel vertical positions: stageStart × 1500vh (see lib/journey.ts ranges). */

export function Hero() {
  return (
    <div className="absolute top-0 left-0 right-0 flex h-screen items-center px-6 md:pl-32 md:pr-16">
      {/* soft scrim so text stays legible over the board on the right */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.78) 38%, rgba(5,7,10,0.25) 62%, rgba(5,7,10,0) 80%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-auto relative w-full max-w-2xl">
        <p className="net-tag mb-6">TEST BENCH 01 · DIGITAL TWIN OF A CUSTOM MULTIMETER</p>
        <h1 className="font-display text-[2.9rem] leading-[0.98] md:text-8xl font-semibold tracking-[-0.03em] text-paper">
          Muhammad
          <br />
          Ahmad Sohail
        </h1>
        <div className="hero-rule mt-8 mb-6 max-w-md" aria-hidden />
        <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.25em] text-muted">ROLE</p>
            <p className="mt-1 font-display text-sm md:text-base text-paper/90">
              Electrical &amp; Electronic Engineer
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.25em] text-muted">FOCUS</p>
            <p className="mt-1 text-sm md:text-base text-[#aab6c6]">
              Power electronics · Embedded · PCB design
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.25em] text-muted">LOCATION</p>
            <p className="mt-1 text-sm md:text-base text-[#aab6c6]">
              Manchester, UK · 53.48°N
            </p>
          </div>
        </div>
        <p className="mt-10 font-mono text-[0.68rem] tracking-[0.3em] text-muted">
          DESIGNING HARDWARE THAT SOLVES REAL PROBLEMS
        </p>
      </div>
    </div>
  );
}

export function JourneyPanels() {
  return (
    <>
      {/* 0.06 - voltage input */}
      <Panel topVh={90} side="right">
        <PanelCard
          net="STAGE 01 · J5 AC VIN"
          title="Voltage input"
          chips={["DC 0–2 V / 0–20 V", "AC 0–20 Vp-p", "Reverse protection"]}
        >
          A test voltage enters the board at the input jack. It is the same signal
          you are now following. Everything downstream of this pad is circuitry
          I designed, prototyped on breadboard, and routed onto this PCB in
          KiCad.
        </PanelCard>
      </Panel>

      {/* 0.12 - conditioning / protection */}
      <Panel topVh={180} side="left">
        <PanelCard
          net="STAGE 02 · D1–D4 + G5V-2"
          title="Input conditioning"
          chips={["Clamp diodes", "Omron G5V-2 relay", "C93401 relay driver", "Range switching"]}
        >
          Clamp diodes bound the input, and a DPDT relay driven by the MCU
          through a C93401 switches measurement ranges so an out-of-range
          input never reaches the analog front end.
        </PanelCard>
      </Panel>

      {/* 0.18 - divider */}
      <Panel topVh={270} side="right">
        <PanelCard
          net="STAGE 03 · R10/R8 NETWORK"
          title="Voltage divider"
          chips={["10K / 100K ladder", "82K · 20K trim", "0.01 V resolution @ 2 V"]}
        >
          A precision resistor ladder scales the unknown voltage into the
          0&ndash;5&nbsp;V window of the ADC: 0.01&nbsp;V steps on the 2&nbsp;V
          range, 0.1&nbsp;V on the 20&nbsp;V range.
        </PanelCard>
      </Panel>

      {/* 0.24 - amplifier */}
      <Panel topVh={360} side="left">
        <PanelCard
          net="STAGE 04 · U3 LM358 → ADC0"
          title="LM358 buffer stage"
          chips={["Unity-gain buffer", "ICL7660 rail inverter", "LM385 reference", "Low-pass filter"]}
        >
          An LM358 buffers the divider so the ADC sees a low source impedance.
          An ICL7660 generates the negative rail for bipolar measurement, and a
          second LM358 stage low-pass filters the 200&nbsp;Hz–7&nbsp;kHz
          PWM-synthesised sine output.
        </PanelCard>
      </Panel>
    </>
  );
}

export function AboutPanel() {
  return (
    <Panel topVh={450} side="right">
      <PanelCard net="STAGE 05 · U7 ATMEGA328 / ABOUT" title="The engineer behind the board">
        Electrical and Electronic Engineering graduate from De Montfort
        University with a year of industry experience delivering
        production-ready PCB designs at a power electronics company, including
        a commercially completed 220&nbsp;V&nbsp;AC to 12&nbsp;V&nbsp;DC, 60&nbsp;W
        power supply unit.
        <ul className="mt-4 space-y-1.5 font-mono text-[0.75rem] text-[#9fb2c8]" role="list">
          <li>▸ Isolated &amp; non-isolated DC-DC conversion</li>
          <li>▸ Three-phase SPWM motor drives</li>
          <li>▸ SiC MOSFET characterisation</li>
          <li>▸ Thermal management</li>
          <li>▸ Multilayer PCB layout in Altium Designer</li>
        </ul>
      </PanelCard>
    </Panel>
  );
}

export function ExperiencePanel() {
  return (
    <Panel topVh={510} side="left" wide>
      <div className="panel p-6 md:p-8">
        <Ticks />
        <p className="net-tag mb-3">INDUSTRY · AUTOMOTIVE DEVICES · 09/2024 – 08/2025</p>
        <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
          Industry placement: production hardware
        </h2>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-[#aab6c6]">
          A year designing shipped hardware at a power electronics company,
          nominated for Best Placement Student of the Year.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            [
              "220–240V AC → 12V DC · 60 W",
              "Schematic and PCB layout for a commercially completed power supply, delivered on time, meeting all key milestones",
            ],
            [
              "ESP32 multi-sensor module",
              "Engineered the complete schematic and PCB for an IoT sensor system",
            ],
            [
              "RJ45-ESP32 module",
              "Wired-comms variant designed from schematic through layout",
            ],
            [
              "BlueNRG-M2 BLE solutions",
              "Bluetooth Low Energy hardware development and integration",
            ],
            [
              "Multilayer PCB design",
              "High-quality multilayer layouts in Altium Designer",
            ],
            [
              "Theory → production",
              "Applied theoretical knowledge to real-world, innovative hardware",
            ],
          ].map(([t, d]) => (
            <div key={t} className="rounded-md border border-edge bg-panel/70 p-4">
              <p className="font-mono text-[0.72rem] tracking-wide text-spark">{t}</p>
              <p className="mt-1 text-[0.8rem] leading-snug text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function DemoSection() {
  return (
    <div className="absolute left-0 right-0" style={{ top: "570vh", height: "150vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center px-5">
        <div className="pointer-events-auto w-full">
          <p className="net-tag mb-6 text-center">
            STAGE 06 · LIVE MEASUREMENT · J3 LCD
          </p>
          <LiveDemo />
        </div>
      </div>
    </div>
  );
}

/* ---- Project chapters: the signal docks at each real board ------------- */

export function ProjectChapters() {
  return (
    <>
      {/* 0.48 - IoT board */}
      <Panel topVh={720} side="left">
        <PanelCard
          net="STATION 02 · MULTIPURPOSE IOT BOARD"
          title="Two MCUs, one bus"
          chips={["ESP8266-12E client", "Arduino Nano server", "I²C · 15/17 ms polling", "MPU6050", "MQTT"]}
        >
          The signal has crossed the bench to a real board: a NodeMCU ESP8266
          client and Arduino Nano server running concurrent code modules over
          I²C. The Nano interrogates a GY-521 MPU6050 every 15&nbsp;ms and
          reports orientation as single-character states; the ESP8266 collects
          every 17&nbsp;ms, with web-based monitoring and MQTT control.
        </PanelCard>
      </Panel>

      {/* 0.58 - supercapacitor */}
      <Panel topVh={870} side="right">
        <PanelCard
          net="STATION 03 · SUPERCAP ENERGY STORAGE"
          title="Replacing lithium with capacitance"
          chips={["Maxwell BCAP3400 · 3400 F", "2S×3P / 2S×14P banks", "NI Multisim", "< 2% error"]}
        >
          Research replacing ENERGUS Li8p25RT (72&nbsp;Wh) and Molicel P42A
          lithium targets with BCAP3400 supercapacitor banks for low-power
          energy harvesting, using datasheet-driven energy analysis, equivalent
          capacitance derivation, and charge/discharge circuits validated
          against a five-interval load profile (1.5&nbsp;V standby to 5&nbsp;V
          peak) to under 2% error.
        </PanelCard>
      </Panel>

      {/* 0.68 - motor drive */}
      <Panel topVh={1020} side="left">
        <PanelCard
          net="STATION 04 · 3-PHASE MOTOR DRIVE"
          title="SPWM for a 48 V e-axle"
          chips={["Arduino Mega control", "PWM 3-phase sine", "Single-leg → full bridge", "Speed & torque control"]}
        >
          An Arduino Mega-based control system generating PWM three-phase
          sinusoidal signals to operate a black-box power module and induction
          motor for a 48&nbsp;VDC hybrid-EV e-axle. Bridge switching was tested
          in stages, from single-leg operation up to full three-phase waveform
          generation.
        </PanelCard>
      </Panel>

      {/* 0.78 - motor drive in the vehicle */}
      <Panel topVh={1170} side="right">
        <PanelCard
          net="STATION 05 · E-AXLE IN THE VEHICLE"
          title="Where the drive ends up"
          chips={["48V HEV application", "E-axle integration", "Low-cost traction", "System context"]}
        >
          The same motor control in its real context: a low-cost hybrid
          electric vehicle e-axle. This is the point of power electronics:
          the inverter on the bench becomes torque at the wheel.
        </PanelCard>
      </Panel>
    </>
  );
}

/* ---- Skills + remaining projects ---------------------------------------- */

const SKILLS: [string, string[]][] = [
  ["EDA / CAD", ["Altium Designer", "KiCad", "Multilayer PCB layout"]],
  ["Simulation", ["LTspice", "Multisim", "DIgSILENT PowerFactory", "IPSA"]],
  ["Embedded", ["Embedded / bare-metal C", "Arduino", "Intel Quartus Prime"]],
  ["Power", ["DC-DC conversion", "SPWM motor drives", "SiC MOSFETs · thermal"]],
];

const MORE_PROJECTS: [string, string][] = [
  [
    "Traffic lights controller",
    "Bare-metal C on ATMEGA328P: dynamic timing, priority modes, interrupts, accelerometer-based priority, ESP8266 remote monitoring.",
  ],
  [
    "DC-DC converter analysis",
    "Shunt, series-pass and buck converters modelled and lab-verified; isolated converter and ETD ferrite transformer design; SiC / IGBT device evaluation.",
  ],
];

export function SkillsSection() {
  return (
    <Panel topVh={1320} side="center" wide>
      <div>
        <p className="net-tag mb-2 text-center">BILL OF MATERIALS · TOOLCHAIN</p>
        <h2 className="text-center font-display text-3xl md:text-4xl font-medium tracking-tight">
          Interconnected skills
        </h2>
        <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-signal/60 to-transparent lg:block"
          />
          {SKILLS.map(([group, items]) => (
            <div key={group} className="panel relative p-5">
              <Ticks />
              <p className="net-tag !text-[0.55rem]">{group}</p>
              <ul className="mt-3 space-y-2" role="list">
                {items.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-[#c4cfdd]">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_#00FFF0]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MORE_PROJECTS.map(([t, d]) => (
            <div key={t} className="panel p-5">
              <Ticks />
              <p className="net-tag !text-[0.55rem]">ALSO ON THE NETLIST</p>
              <h3 className="mt-1 font-display text-base font-medium">{t}</h3>
              <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-mono text-[0.68rem] tracking-[0.12em] text-muted">
          Google Project Management Certificate · Nominated Best Placement
          Student of the Year · Co-founder of ZamWheelz, leading a team of 13
        </p>
      </div>
    </Panel>
  );
}

export function ContactSection() {
  return (
    <Panel topVh={1500} side="center" wide>
      <div className="text-center">
        <p className="net-tag mb-4">SIGNAL OUT · TP1</p>
        <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight">
          Let&apos;s build hardware
          <br />
          that matters
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          Muhammad Ahmad Sohail · Electrical &amp; Electronic Engineer ·
          Manchester, UK. The measurement is complete. The next signal path
          starts with a conversation.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a className="btn-signal" href="mailto:muhammadahmadsoh@gmail.com">
            Email me
          </a>
          <a
            className="btn-ghost"
            href="https://linkedin.com/in/muhammadahmadsohail"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a className="btn-ghost" href="/cv.pdf" download="Muhammad-Ahmad-Sohail-CV.pdf">
            Download CV
          </a>
        </div>
        <p className="mt-14 font-mono text-[0.6rem] tracking-[0.25em] text-[#39434f]">
          PCB · SCHEMATIC · FIRMWARE · SITE · DESIGNED BY M. AHMAD SOHAIL
        </p>
      </div>
    </Panel>
  );
}
