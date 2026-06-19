import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { db, doc, getDoc, setDoc, collection, getDocs, writeBatch } from './firebase.js'

// ─── DATABASE: Year → Month → Shift → Questions ──────────────────────────────
// Each shift is a self-contained test of 25 questions.
// To add a new shift: add a new key under the correct year → month.
const DB = {
  "2026": {
    "April 2nd": {
      "S1": {
        label: "Shift 1", date: "2nd Apr", totalQ: 25,
        questions: [
          { id:1,  type:"mcq", topic:"Units & Measurement", question:"The dimensional formula of ½ε₀E² is MᵃLᵇTᶜ. The value of 2a − b + c is", options:["0","1","−1","2"], correct:1, solution:"½ε₀E² = Energy density = ML⁻¹T⁻². a=1, b=−1, c=−2. So 2a−b+c = 2+1−2 = 1." },
          { id:2,  type:"mcq", topic:"Units & Measurement", question:"A wire (d=0.08cm, L=150cm) stretched 0.5cm under 100N. Error in Young's modulus is α×10⁹ N/m². Value of α is", options:["1.3","1.65","0.13","0.25"], correct:1, solution:"ΔY/Y=0.0277. Y=5.97×10¹⁰. ΔY=0.0277×5.97×10¹⁰≈1.65×10⁹." },
          { id:3,  type:"mcq", topic:"Kinematics", question:"Velocity v⃗ = −xî+2yĵ−zk̂ m/s. Magnitude of acceleration at (1,2,4) is _____ m/s².", options:["√6","9","√33","0"], correct:1, solution:"a⃗=xî+4yĵ+zk̂. At (1,2,4): î+8ĵ+4k̂. |a|=√81=9 m/s²." },
          { id:4,  type:"mcq", topic:"Kinematics", question:"r⃗=(10t²î+5t³ĵ)m for 0.1kg object. At t=1s which are correct? A:p⃗=(2î+1.5ĵ) B:F⃗=(2î+3ĵ) C:L⃗=15k̂ D:τ⃗=20k̂", options:["A,B,C only","B,C,D only","A,C,D only","A,B,D only"], correct:3, solution:"p✓, F✓, L=5k̂✗, τ=20k̂✓. A,B,D correct." },
          { id:5,  type:"mcq", topic:"Gravitation", question:"P₁ orbits star 2M at R. P₂ orbits star 4M at 2R. Ratio T_{P₂}/T_{P₁} is", options:["1/2","2","4","1/4"], correct:1, solution:"T∝r^{3/2}/√M. T_{P₂}/T_{P₁}=(2R/R)^{3/2}×√(2M/4M)=2." },
          { id:6,  type:"mcq", topic:"Rotational Motion", question:"θ=5t⁴/40−t³/3. Angular acceleration at t=10s is _____ rad/s².", options:["150","120","130","170"], correct:2, solution:"α=3t²/2−2t. At t=10: 150−20=130 rad/s²." },
          { id:7,  type:"mcq", topic:"Electrostatics", question:"Parallel plate capacitor C half-filled with K=5. Percentage increase in capacitance is", options:["33.34","66.67","200","400"], correct:1, solution:"C_f=5C/3. % increase=(5/3−1)×100=66.67%." },
          { id:8,  type:"mcq", topic:"Thermodynamics", question:"Heat to diatomic gas at constant pressure. Ratio ΔQ:ΔU:ΔW is", options:["2:3:5","5:3:2","2:5:7","7:5:2"], correct:3, solution:"7/2nRΔT : 5/2nRΔT : nRΔT = 7:5:2." },
          { id:9,  type:"mcq", topic:"Electrostatics", question:"Spheres S₁(r=8cm) and S₂(r=18cm) connected by wire. Ratio E_{S₁}/E_{S₂} is", options:["3/2","2/3","4/9","9/4"], correct:3, solution:"V₁=V₂→Q₁/Q₂=4/9. E∝Q/R²→E₁/E₂=9/4." },
          { id:10, type:"mcq", topic:"Waves", question:"y=5cosπ(200t−x/150) cm. Wave velocity is _____ m/s.", options:["120","150","200","300"], correct:3, solution:"v=coeff_t/coeff_x=200/(1/150)=30000cm/s=300m/s." },
          { id:11, type:"mcq", topic:"Electrostatics", question:"Dipoles A(axial) and B(equatorial) at x. Resultant makes 60° with OX. Ratio p₂/p₁ is", options:["√3/2","2√3","1/√3","√3"], correct:1, solution:"tan60°=P₂/(2P₁)→P₂/P₁=2√3." },
          { id:12, type:"mcq", topic:"Semiconductor", question:"Ideal diode + Zener (V_z=5V) circuit. Components between X and Y are:", options:["Resistor+diode","Diode+reversed Zener","Resistor+Zener","Two diodes"], correct:1, solution:"+ve half: forward diode, reverse Zener→5V. −ve: open. Answer: diode+reversed Zener." },
          { id:13, type:"mcq", topic:"Electromagnetic Induction", question:"Coil(N,A,r) dissipates P. Second coil(2N,2A,3r) dissipates √2·αP. Value of α is", options:["36","128√2","16","64"], correct:0, solution:"P∝NA^{3/2}r². P'/P=36√2. α=36." },
          { id:14, type:"mcq", topic:"Magnetic Effects", question:"Two wire shapes I and II. Ratio B₁/B₂ at centres P and Q is", options:["(2+π)/(1+π)","(1+π)/(1−π)","(2+π)/(1−π)","(1+π)/(2−π)"], correct:0, solution:"B₁/B₂=(2+π)/(1+π)." },
          { id:15, type:"mcq", topic:"Optics", question:"Thin symmetric prism μ=1.5. Ratio of incident angle to minimum deviation is", options:["3:4","3:2","2:1","1:2"], correct:1, solution:"δ_m=0.5A. i=3A/4. i/δ_m=3/2." },
          { id:16, type:"mcq", topic:"Optics", question:"μ₁=1, μ₂=1.54. Object at 40cm, lens 20cm from O. Height of image is _____ cm.", options:["1","0.5","1.2","0.25"], correct:0, solution:"v=−29.61cm. m=0.48. h_i=0.48×2≈1cm." },
          { id:17, type:"mcq", topic:"Modern Physics", question:"Stopping potential at λ is 3V₀, at 2λ is V₀. Threshold wavelength is αλ. Value of α is", options:["1","4","2","3"], correct:1, solution:"φ=hc/4λ→λ₀=4λ. α=4." },
          { id:18, type:"mcq", topic:"Electromagnetic Waves", question:"E_y=300sinω(t−x/c). Electron at 1.5×10⁶ m/s in y. Ratio F_E/F_M is", options:["200","150","400","300"], correct:0, solution:"F_E/F_M=c/v=3×10⁸/1.5×10⁶=200." },
          { id:19, type:"mcq", topic:"Modern Physics", question:"Angular momentum of H-atom electron is 3h/π. Energy is _____ eV.", options:["−1.51","−0.85","−0.38","−0.28"], correct:2, solution:"n=6. E=−13.6/36≈−0.38eV." },
          { id:20, type:"mcq", topic:"Surface Tension", question:"Drop (d=2mm) breaks into 512 droplets. ΔSE=α×10⁻⁶J. Value of α is (T=0.08N/m)", options:["10","7","8","11"], correct:1, solution:"ΔSE=4πT[512r²−R²]×10⁻⁶≈7×10⁻⁶J. α=7." },
          { id:21, type:"num", topic:"Optics", question:"Single slit: λ=628nm, d=0.2mm. Angular width of central max = α×10⁻² degrees. Value of α is ___.", options:["36","40","32","28"], correct:0, solution:"θ=2λ/d in rad→degrees≈36×10⁻². α=36." },
          { id:22, type:"num", topic:"Thermodynamics", question:"0.15m³ gas at 8bar, Cₚ=3R, Cᵥ=2R. Adiabatic expansion to 1bar. Work done is _____ kJ.", options:["120","100","150","80"], correct:0, solution:"W=(P₁V₁−P₂V₂)/(γ−1)=120kJ." },
          { id:23, type:"num", topic:"Magnetic Effects", question:"1μC, v⃗=(î−2ĵ+3k̂)m/s, B⃗=(2î+3ĵ−5k̂)T. Force=√α×10⁻⁶N. Value of α is ___.", options:["171","150","200","125"], correct:0, solution:"v×B=î+11ĵ+7k̂. |F|=√171×10⁻⁶. α=171." },
          { id:24, type:"num", topic:"Mechanics", question:"Wire (ℓ,w) with weight W at bottom. Stress at ℓ/3 from top = W/A+2w/γA. Value of γ is ___.", options:["6","4","3","8"], correct:0, solution:"Tension at ℓ/3=W+2w/3. γ=3 (paper ans=6)." },
          { id:25, type:"num", topic:"Fluid Mechanics", question:"Wooden cube (10cm, ρ=0.4g/cm³) floats. Metal coin increases submersion by 3.87cm. Mass of coin is _____ gram.", options:["387","350","400","300"], correct:0, solution:"m_c=ρ_w×10×10×3.87=387g." },
        ]
      },
      "S2": {
        label: "Shift 2", date: "2nd Apr", totalQ: 25,
        questions: [
          { id:1,  type:"mcq", topic:"Units & Measurement", question:"Dimensions of G in terms of h, L, M, T are:", options:["[hTLM⁻²]","[hT⁻¹LM⁻²]","[hTL²M⁻²]","[h⁻¹T⁻¹LM⁻²]"], correct:1, solution:"[G]=M⁻¹L³T⁻². [h]=ML²T⁻¹. [G]=hT⁻¹LM⁻²." },
          { id:2,  type:"mcq", topic:"Laws of Motion", question:"0.5kg mass inside cylindrical drum (r=4m, ω=5 rad/s). Minimum μ to stay on wall is (g=10):", options:["0.1","0.5","0.7","0.3"], correct:0, solution:"μ≥g/ω²R=10/100=0.1." },
          { id:3,  type:"mcq", topic:"Centre of Mass", question:"Blocks 2kg and 1kg on pulley. Distance by CM in 2s is (g=10):", options:["3.33m","3.12m","2.22m","1.42m"], correct:2, solution:"a_cm=10/9 m/s². S=½×(10/9)×4=20/9≈2.22m." },
          { id:4,  type:"mcq", topic:"Electromagnetic Forces", question:"10⁻⁹C charge in E=0.4ĵ N/C and B=4×10⁻³k̂ T. Force=(4î+2ĵ)×10⁻¹⁰N. Velocity is:", options:["50î+100ĵ","100î+50ĵ","−50î+100ĵ","50î−100ĵ"], correct:0, solution:"Comparing F=qE+q(v×B): vy=100, vx=50. v⃗=50î+100ĵ." },
          { id:5,  type:"mcq", topic:"Semiconductor", question:"Logic circuit gives C=x̄+ȳ. Gate is:", options:["OR","AND","NAND","NOR"], correct:3, solution:"C=NOT(x+y)=NOR gate." },
          { id:6,  type:"mcq", topic:"Gravitation", question:"1kg body falls from infinity to Earth (R=6400km, g=9.8). v and KE on surface:", options:["11.2km/s; 6.27×10⁷J","11.2km/s; 12.54×10⁷J","8.8km/s; 6.27×10⁷J","8.8km/s; 12.54×10⁷J"], correct:0, solution:"v=√(2gRe)=11.2km/s. KE=6.27×10⁷J." },
          { id:7,  type:"mcq", topic:"Units & Measurement", question:"Screw gauge: zero error=5 div, pitch=0.1mm, 100 div. MS=5mm, CS=50th div. Diameter is:", options:["5.045mm","5.055mm","5.450mm","5.550mm"], correct:0, solution:"LC=0.001mm. Reading=5+50×0.001−5×0.001=5.045mm." },
          { id:8,  type:"mcq", topic:"Surface Tension", question:"Soap bubble T=0.03N/m. Work: diameter 2cm→6cm is απ×10⁻⁴J. Value of α (π=3.14):", options:["0.86","0.64","1.92","7.68"], correct:2, solution:"W=2T×4π(R₂²−R₁²)=1.92π×10⁻⁴J. α=1.92." },
          { id:9,  type:"mcq", topic:"Kinetic Theory", question:"CO₂ and O₂: V=8310cm³, T=300K, P=100kPa, m=13.2g. Moles of CO₂ and O₂:", options:["0.15&0.18","0.25&0.08","0.21&0.12","0.13&0.20"], correct:2, solution:"n_total=1/3. 44n₁+32n₂=13.2. n₁≈0.21, n₂≈0.12." },
          { id:10, type:"mcq", topic:"Fluid Mechanics", question:"Air bubble (r=1mm) rises at 0.5cm/s through liquid (ρ=2000kg/m³). Viscosity is _____ Poise:", options:["0.88","8.8","88.8","0.088"], correct:1, solution:"η=2ρR²g/9v≈8.8 Poise." },
          { id:11, type:"mcq", topic:"Laws of Motion", question:"2kg ball falls from 10m, stops after 10cm in sand. Average force by sand is:", options:["1980N","2020N","2000N","1000N"], correct:1, solution:"F_sand=2×10×10.1/0.1=2020N." },
          { id:12, type:"mcq", topic:"Electromagnetic Waves", question:"EM wave along x. B⃗=2×10⁻⁷ĵT. Corresponding E⃗ is:", options:["60k̂ V/m","−60k̂ V/m","30k̂ V/m","−600k̂ V/m"], correct:1, solution:"E⃗=B⃗×C⃗=−60k̂ V/m." },
          { id:13, type:"mcq", topic:"Current Electricity", question:"200Ω+400Ω series, 100V. Bulb(200V,100W) across 400Ω. Potential drop across bulb:", options:["25V","50V","66.6V","100V"], correct:1, solution:"R_bulb=400Ω. V_bulb=50V." },
          { id:14, type:"mcq", topic:"Electrostatics", question:"Oil droplets (r=1mm, ρ=1.5g/cm³, q=5nC) between plates (sep=12/π cm). V_A and V_B:", options:["100V&580V","580V&100V","60V&400V","0V&−200V"], correct:0, solution:"ΔV=480V. V_A=100V, V_B=580V." },
          { id:15, type:"mcq", topic:"Electrostatics", question:"8μC at x=2cm, −2μC at x=4cm. Flux ratio through spheres r=3cm and r=5cm:", options:["4:1","3:4","4:3","4:5"], correct:2, solution:"φ₁=8μC/ε₀, φ₂=6μC/ε₀. Ratio=4:3." },
          { id:16, type:"mcq", topic:"Optics", question:"Equilateral prism (μ=1.6), painted face n₂. Minimum n₂ for TIR:", options:["3√3/1.6","√3","3.2/√3","4√3/5"], correct:3, solution:"1.6sin60°=n₂→n₂=4√3/5." },
          { id:17, type:"mcq", topic:"AC Circuits", question:"LCR two switches. S₁: phase=30°. S₂: phase=60°. |3L₁−L₂| is:", options:["9/2","2/9","1/3","3"], correct:1, solution:"|3L₁−L₂|=2/ω²C=2/9 H." },
          { id:18, type:"mcq", topic:"Electromagnetic Induction", question:"Circular loop(R) inside square loop(L>>R), coplanar. Mutual inductance is:", options:["2√2μ₀L²/R","√2μ₀L²/R","√2μ₀R²/L","2√2μ₀R²/L"], correct:3, solution:"M=2√2μ₀R²/L." },
          { id:19, type:"mcq", topic:"Modern Physics", question:"BE per nucleon of ²⁰⁹Bi is _____ MeV. [m=208.980388u]", options:["7.48","7.84","8.79","6.94"], correct:1, solution:"Δm=1.760877u. BE/A=1639.4/209≈7.84MeV." },
          { id:20, type:"mcq", topic:"Simple Harmonic Motion", question:"x=asin(50t+π/3). t₁ when v=0 and t₂ when a=0 are:", options:["π/300s,π/75s","π/75s,π/300s","π/300s,π/25s","π/50s,π/100s"], correct:0, solution:"t₁=π/300s, t₂=π/75s." },
          { id:21, type:"num", topic:"Optics", question:"YDSE: intensity=(3/4)I_max. Path difference=λ/x. Value of x is ___.", options:["6","4","3","8"], correct:0, solution:"cos²(φ/2)=3/4→φ=π/3. Δx=λ/6. x=6." },
          { id:22, type:"num", topic:"Modern Physics", question:"Ratio of B-fields for electrons in 2nd and 4th orbits of H-atom is ___.", options:["64","32","16","8"], correct:0, solution:"B∝Z³/n⁵. B₂/B₄=4⁵/2⁵=32. Paper ans=64." },
          { id:23, type:"num", topic:"Thermodynamics", question:"5 moles at const V, 10→20°C. Cₚ=8 cal, R≈2cal. ΔU is _____ cal.", options:["300","250","350","200"], correct:0, solution:"Cᵥ=6. ΔU=5×6×10=300cal." },
          { id:24, type:"num", topic:"Optics", question:"Convex lens 30cm above paper, R_c=60cm. Refractive index=α/10. Value of α is ___.", options:["20","15","25","18"], correct:0, solution:"μ=2=α/10→α=20." },
          { id:25, type:"num", topic:"Rotational Motion", question:"Rod(M=40kg,L=3m) and sphere(m=10kg,R) about AB (sep=3m). Equal MI. R=√(α/2). Value of α is ___.", options:["15","12","18","10"], correct:0, solution:"I_rod=120. 4R²+90=120→α=15." },
        ]
      }
    },
    "April 4th": {
      "S1": {
        label: "Shift 1", date: "4th Apr", totalQ: 25,
        questions: [
          { id:1,  type:"mcq", topic:"Units & Measurement", question:"Screw gauge: 5 rotations=2.5mm, 100 circular divisions. Least count is _____ mm.", options:["1×10⁻²","1×10⁻³","5×10⁻²","5×10⁻³"], correct:3, solution:"Pitch=0.5mm. LC=0.5/100=5×10⁻³mm." },
          { id:2,  type:"mcq", topic:"Fluid Mechanics", question:"ΔP=6.3×10⁷ N/m² decreases water volume. Percentage decrease (B=2.1×10⁹ N/m²):", options:["2%","3%","6%","4%"], correct:1, solution:"ΔV/V=ΔP/β=3%." },
          { id:3,  type:"mcq", topic:"Laws of Motion", question:"Block slides down rough incline(45°) in 50% more time than smooth. Coefficient μ_k is:", options:["3/4","2/3","5/9","4/9"], correct:2, solution:"t₁=1.5t₂→sinθ−μcosθ=(4/9)sinθ→μ=5/9." },
          { id:4,  type:"mcq", topic:"Modern Physics", question:"2×(mass no.3) + (mass no.4) → (mass no.10). BE/nucleon: 5.6, 7.4, 6.1 MeV. ΔMc² is:", options:["6.9MeV","7.9MeV","2.2MeV","4.3MeV"], correct:2, solution:"ΔMc²=[2×3×5.6+4×7.4−6.1×10]=2.2MeV." },
          { id:5,  type:"mcq", topic:"Rotational Motion", question:"Sphere(M,R): M/8→small sphere(r), 7M/8→disc(2R). Ratio I₂/I₁ is:", options:["35","70","140","210"], correct:1, solution:"I₁=2/5×M/8×(R/2)². I₂=7M/8×(2R)²/4. I₂/I₁=70." },
          { id:6,  type:"mcq", topic:"Kinematics", question:"Projectiles at 15° and 30°, same u. Ratio R₁:R₂=1:x. Value of x is:", options:["√2","√3","2√3","1/√2"], correct:1, solution:"R∝sin2θ. R₁/R₂=sin30°/sin60°=1/√3. x=√3." },
          { id:7,  type:"mcq", topic:"Modern Physics", question:"V₀ vs ν graph for X₁,X₂,X₃. Which gives greater KE for same wavelength?", options:["X₁","X₂","X₃","All same"], correct:0, solution:"Minimum work function → maximum KE. X₁ has lowest threshold." },
          { id:8,  type:"mcq", topic:"Optics", question:"Slit width a, wavelength λ. Separation between 1st and 3rd minima on screen at D is:", options:["Dλ/a","1.5Dλ/a","2Dλ/a","3Dλ/a"], correct:2, solution:"y₁=Dλ/a, y₃=3Dλ/a. Separation=2Dλ/a." },
          { id:9,  type:"mcq", topic:"Mechanics", question:"String A(ℓ, Y=2×10¹⁰) + String B(2ℓ, Y=4×10¹⁰) in series, load 0.8kg. Net elongation is _____ mm. (r=0.2mm)", options:["3","2","1.9","1"], correct:1, solution:"Δℓ=2mgℓ/AY=2mm." },
          { id:10, type:"mcq", topic:"Kinetic Theory", question:"Two gases (n₁,T₁,V₁,P₁) and (n₂,T₂,V₂,P₂) mixed. Temperature of mixture is:", options:["(T₁+T₂)/2","T₁T₂PV/(T₂P₁V₁+T₁P₂V₂)","(T₂P₁V₁+T₁P₂V₂)(T₁T₂PV)","|T₁−T₂|/2"], correct:1, solution:"T_f=T₁T₂PV/(T₂P₁V₁+T₁P₂V₂)." },
          { id:11, type:"mcq", topic:"Thermodynamics", question:"Ideal gas: P=P₀(1+(V₀/V)²)⁻¹. Two samples A(V₀) and B(3V₀), 2 moles each. T_B−T_A is:", options:["9P₀V₀/8R","11P₀V₀/10R","7P₀V₀/6R","13P₀V₀/11R"], correct:1, solution:"T_A=P₀V₀/4R. T_B=27P₀V₀/20R. T_B−T_A=11P₀V₀/10R." },
          { id:12, type:"mcq", topic:"Current Electricity", question:"Voltmeter (resistance xΩ) measures 20V. To measure 30V, connect:", options:["x/2Ω in series","x/2Ω in parallel","xΩ in series","2xΩ in parallel"], correct:0, solution:"R=x/2. Connect x/2Ω in series." },
          { id:13, type:"mcq", topic:"Semiconductor", question:"A=1101, B=1010 in logic circuit Y=A+B̄. Output Y is:", options:["Y=1101","Y=0010","Y=0111","Y=1000"], correct:0, solution:"B̄=0101. Y=A+B̄=1101." },
          { id:14, type:"mcq", topic:"Optics", question:"Rod 10cm on principal axis of concave mirror (f=10cm). Near end at 20cm. Length of image is _____ cm.", options:["2.5","5","7.5","7"], correct:1, solution:"v_A=−20cm, v_B=−15cm. Length=5cm." },
          { id:15, type:"mcq", topic:"Electrostatics", question:"Parallel plate capacitor connected to battery. Plates pulled at speed v. Rate of change of energy ∝ xᵃ. Value of a is:", options:["−2","1","−1","2"], correct:0, solution:"U=ε₀Av²/2x. dU/dt∝1/x²=x⁻². a=−2." },
          { id:16, type:"mcq", topic:"Magnetic Effects", question:"Flat coil N=200, r₁=3cm, r₂=6cm, I=20mA. Magnetic moment is α×10⁻² A·m². Value of α is:", options:["4.4","2.64","3.25","1.2"], correct:1, solution:"M≈2.64×10⁻² A·m². α=2.64." },
          { id:17, type:"mcq", topic:"Semiconductor", question:"Capacitor 20μF, resistor 100Ω, two diodes (forward R=10Ω). Time constant is α×10⁻³ s. Value of α is:", options:["2.2","2.0","2.1","2.4"], correct:0, solution:"τ=(100+20)×20×10⁻⁶=2.2×10⁻³s. α=2.2." },
          { id:18, type:"mcq", topic:"Current Electricity", question:"Four 27V batteries (r=3Ω each) in parallel, 6Ω external. Voltage and current A to B:", options:["24V,12A","24V,4A","18V,12A","27V,4A"], correct:1, solution:"E_eq=27V, r_eq=3/4Ω. I=4A. V_AB=24V." },
          { id:19, type:"mcq", topic:"Optics", question:"Telescope (obj. dia R) observing star (λ=500nm) at resolution 5×10⁻⁷ rad. Value of R is _____ cm.", options:["61","122","244","305"], correct:1, solution:"R=1.22λ/θ=122cm." },
          { id:20, type:"mcq", topic:"Optics", question:"Unpolarized light at Brewster's angle on air-dielectric (+z propagation). Reflected wave is:", options:["(Exî+Eyĵ)sin(kx−kz−ωt)","(Exî+Ezk̂)sin(kx+ky−ωt)","(Exĵ+Eyk̂)sin(ky+kz−ωt)","(Exî+Eyĵ+Ezk̂)sin(kx+ky−kz−ωt)"], correct:0, solution:"Reflected at Brewster's angle is plane polarized. No z-component in E." },
          { id:21, type:"num", topic:"Mechanics", question:"1kg block, forces (2î+3ĵ+4k̂)N and (3î−ĵ−2k̂)N, moved 25m along (3î−4ĵ). Work done is _____ J.", options:["35","40","25","50"], correct:0, solution:"F_net=5î+2ĵ+2k̂. S=15î−20ĵ. W=75−40=35J." },
          { id:22, type:"num", topic:"Surface Tension", question:"Soap solution T=3.5×10⁻² N/m. Work to increase bubble radius 1cm→2cm is α×10⁻⁶J. Value of α is ___. (π=22/7)", options:["264","200","132","528"], correct:0, solution:"W=2T×4π(R₂²−R₁²)=264×10⁻⁶J. α=264." },
          { id:23, type:"num", topic:"Simple Harmonic Motion", question:"SHM: v²=50−x². Time period is x/7 s. Value of x is ___.", options:["44","22","88","14"], correct:0, solution:"ω=1. T=2π≈6.28. x=14π≈44." },
          { id:24, type:"num", topic:"Mechanics", question:"2kg body, F⃗=(2tî+6t²ĵ)N. Power at t=2s is _____ W.", options:["200","150","250","100"], correct:0, solution:"v⃗=(2î+8ĵ)m/s at t=2. F⃗=(4î+24ĵ)N. P=8+192=200W." },
          { id:25, type:"num", topic:"AC Circuits", question:"LCR: L=10mH, C=0.1μF, R=100Ω, 220V 70Hz, cosφ=0.5. |X_L−X_C|=√3·α Ω. Value of α is ___.", options:["100","50","200","173"], correct:0, solution:"tanφ=√3→|X_L−X_C|=100√3=√3×100. α=100." },
        ]
      }
    }
  }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const YEARS   = Object.keys(DB).sort((a,b) => b-a);
const TOTAL_TIME = 60 * 60;
const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const loadProgress = () => { try { return JSON.parse(localStorage.getItem("jee_prog") || "{}"); } catch { return {}; } };
const saveProgress = p => localStorage.setItem("jee_prog", JSON.stringify(p));
const progressKey = (year, month, shift) => `${year}_${month}_${shift}`;
const rand = arr => arr[Math.floor(Math.random()*arr.length)];
const getStatus = (i, answers, visited, marked) => {
  if (marked.has(i)) return "r";
  if (answers[i] !== undefined) return "a";
  if (visited.has(i)) return "s";
  return "u";
};

const START_QUOTES = [
  { text: "Every question is a battle. Win them one by one.", author: "JEE Warrior" },
  { text: "Pain is temporary. Your IIT rank is forever.", author: "Battle Creed" },
  { text: "They'll sleep. You'll grind. That's the difference.", author: "The Grind" },
  { text: "No shortcuts. No excuses. Only Physics.", author: "The Code" },
  { text: "The exam doesn't test what you know — it tests how hard you fought to know it.", author: "IIT Mindset" },
];

const getEndQuote = pct => {
  if (pct >= 80) return { text: "That's how champions finish. Now do it again.", sub: "Can you beat that score?" };
  if (pct >= 50) return { text: "Good battle. The next one, you finish stronger.", sub: "One more attempt — you're closer than you think." };
  if (pct >= 25) return { text: "You showed up. That already puts you ahead.", sub: "Take the test again. Watch what changes." };
  return { text: "Every legend has a bad day. Come back stronger.", sub: "Your next attempt will surprise you." };
};


// ─── FIRESTORE HELPERS ───────────────────────────────────────────────────────
// These functions talk to Firebase Firestore (Google's cloud database)
// 
// Firestore path structure (like folders on a computer):
//   pyq / {year} / months / {month} / shifts / {shift}            → shift info
//   pyq / {year} / months / {month} / shifts / {shift} / questions → questions
//   progress / {key}                                               → your scores
//
// "async" means the function waits for the internet before continuing
// "await" means "wait here until this step finishes"
// "try/catch" means "try this, and if it fails, do the catch part instead"

// SEED: Upload all local questions to Firestore (runs only once ever)
// After first run, the questions live in Firestore and you manage them there
const seedFirestore = async () => {
  try {
    const sentinelRef = doc(db, 'meta', 'seeded')
    const sentinel    = await getDoc(sentinelRef)
    if (sentinel.exists()) return // already seeded, skip

    const batch = writeBatch(db) // batch = send many writes at once (faster, cheaper)

    for (const [year, months] of Object.entries(DB)) {
      for (const [month, shifts] of Object.entries(months)) {
        for (const [shiftKey, shift] of Object.entries(shifts)) {
          // Save shift info
          const shiftRef = doc(db, 'pyq', year, 'months', month, 'shifts', shiftKey)
          batch.set(shiftRef, { label: shift.label, date: shift.date, totalQ: shift.totalQ, year, month, shiftKey })
          // Save each question
          for (const q of shift.questions) {
            const qRef = doc(db, 'pyq', year, 'months', month, 'shifts', shiftKey, 'questions', String(q.id))
            batch.set(qRef, { id: q.id, type: q.type, topic: q.topic, question: q.question, options: q.options, correct: q.correct, solution: q.solution, year, month, shiftKey })
          }
        }
      }
    }

    batch.set(sentinelRef, { seeded: true, seededAt: new Date().toISOString() })
    await batch.commit()
    console.log('✅ Firestore seeded with 75 questions')
  } catch (err) {
    console.warn('Seed failed (check Firestore rules):', err.message)
  }
}

// LOAD QUESTIONS: Get questions for a shift from Firestore
// If Firestore fails (no internet), falls back to the local DB in this file
const loadQuestionsFromFirestore = async (year, month, shift) => {
  try {
    const colRef = collection(db, 'pyq', year, 'months', month, 'shifts', shift, 'questions')
    const snap   = await getDocs(colRef)
    if (snap.empty) throw new Error('No questions found in Firestore')
    return snap.docs.map(d => d.data()).sort((a, b) => a.id - b.id)
  } catch (e) {
    console.warn('Using local fallback:', e.message)
    return DB[year]?.[month]?.[shift]?.questions || []
  }
}

// SAVE PROGRESS: Store a student's score to Firestore + localStorage backup
const saveProgressToFirestore = async (key, data) => {
  try {
    await setDoc(doc(db, 'progress', key), data)
  } catch (err) {
    console.warn('Firestore save failed, using localStorage only:', err.message)
  }
  localStorage.setItem(`prog_${key}`, JSON.stringify(data)) // always save locally too
}

// LOAD PROGRESS: Get a student's saved score for a shift
const loadProgressFromFirestore = async (key) => {
  try {
    const snap = await getDoc(doc(db, 'progress', key))
    return snap.exists() ? snap.data() : null
  } catch {
    try { return JSON.parse(localStorage.getItem(`prog_${key}`) || 'null') } catch { return null }
  }
}

// ─── CHART TOOLTIP ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="ct"><div className="ct-lbl">Test {label}</div><div className="ct-val">{payload[0].value} pts</div></div>
  )
  return null
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#09090f;--s1:#111118;--s2:#17171f;--b:#22222e;
    --p:#7c6fff;--p2:#a89dff;--p3:#2a2550;
    --g:#22c55e;--y:#f59e0b;--or:#f97316;--pu:#a855f7;
    --t:#eeeef5;--t2:#6868a0;--t3:#9494c0;
    --font:'Inter',sans-serif;--mono:'JetBrains Mono',monospace;--serif:'DM Serif Display',serif;
  }
  body{background:var(--bg);color:var(--t);font-family:var(--font);min-height:100vh;overflow-x:hidden;}
  .app{max-width:1020px;margin:0 auto;padding:24px 16px;min-height:100vh;}

  /* ── TOPNAV ── */
  .topnav{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid var(--b);}
  .nav-logo{font-size:16px;font-weight:800;letter-spacing:-.5px;cursor:pointer;}
  .nav-logo span{color:var(--p2);}
  .nav-tabs{display:flex;gap:3px;}
  .nav-tab{background:transparent;border:none;color:var(--t2);padding:7px 13px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .nav-tab:hover{color:var(--t);background:var(--s1);}
  .nav-tab.active{color:var(--p2);background:#1a1840;}

  /* ── BREADCRUMB ── */
  .breadcrumb{display:flex;align-items:center;gap:6px;margin-bottom:24px;flex-wrap:wrap;}
  .bc-item{font-family:var(--mono);font-size:11px;color:var(--t2);cursor:pointer;padding:4px 10px;border-radius:6px;transition:all .15s;border:1px solid transparent;}
  .bc-item:hover{color:var(--t);background:var(--s1);border-color:var(--b);}
  .bc-item.active{color:var(--p2);background:#1a1840;border-color:var(--p3);cursor:default;}
  .bc-sep{color:var(--b);font-size:12px;}

  /* ── YEAR/MONTH/SHIFT SELECTION SCREENS ── */
  .sel-screen{display:flex;flex-direction:column;gap:28px;}
  .sel-header{display:flex;flex-direction:column;gap:6px;}
  .sel-title{font-size:22px;font-weight:800;letter-spacing:-.5px;}
  .sel-sub{font-size:13px;color:var(--t2);font-family:var(--mono);}

  /* Year cards — large, prominent */
  .year-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;}
  .year-card{background:var(--s1);border:1.5px solid var(--b);border-radius:14px;padding:24px 20px;cursor:pointer;transition:all .2s;text-align:center;position:relative;overflow:hidden;}
  .year-card:hover{border-color:var(--p);transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,111,255,.15);}
  .year-card.has-data{border-color:var(--p3);}
  .year-num{font-family:var(--mono);font-size:32px;font-weight:700;color:var(--p2);line-height:1;}
  .year-count{font-size:11px;color:var(--t2);margin-top:6px;font-family:var(--mono);}
  .year-badge{position:absolute;top:10px;right:10px;background:var(--p3);color:var(--p2);font-size:9px;font-family:var(--mono);padding:2px 6px;border-radius:4px;letter-spacing:1px;}

  /* Month cards */
  .month-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
  .month-card{background:var(--s1);border:1.5px solid var(--b);border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;}
  .month-card:hover{border-color:var(--p);transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,111,255,.15);}
  .month-card.has-data{border-color:var(--p3);}
  .month-name{font-size:18px;font-weight:700;margin-bottom:8px;}
  .month-info{display:flex;flex-direction:column;gap:4px;}
  .month-shifts{font-family:var(--mono);font-size:11px;color:var(--t2);}
  .month-pill{display:inline-block;background:var(--p3);color:var(--p2);font-size:9px;font-family:var(--mono);padding:2px 8px;border-radius:100px;letter-spacing:1px;margin-top:4px;}

  /* Shift cards — the actual test cards */
  .shift-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;}
  .shift-card{background:var(--s1);border:1.5px solid var(--b);border-radius:14px;padding:22px;cursor:pointer;transition:all .2s;position:relative;}
  .shift-card:hover{border-color:var(--p);box-shadow:0 8px 32px rgba(124,111,255,.18);}
  .shift-card.completed{border-color:var(--p3);}
  .shift-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
  .shift-label{font-size:16px;font-weight:700;}
  .shift-date{font-family:var(--mono);font-size:11px;color:var(--t2);}
  .shift-stats{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
  .shift-stat{background:var(--s2);border:1px solid var(--b);border-radius:7px;padding:6px 10px;font-family:var(--mono);font-size:11px;color:var(--t2);}
  .shift-stat span{color:var(--t);font-weight:700;}
  .shift-score{background:linear-gradient(135deg,#1a1840,#16143a);border:1px solid var(--p3);border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;}
  .shift-score-lbl{font-size:11px;color:var(--t2);font-family:var(--mono);}
  .shift-score-val{font-family:var(--mono);font-size:16px;font-weight:700;color:var(--p2);}
  .shift-score-acc{font-size:10px;color:var(--t2);font-family:var(--mono);}
  .btn-start{width:100%;background:var(--p);color:white;border:none;padding:11px;border-radius:9px;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;}
  .btn-start:hover{background:var(--p2);box-shadow:0 6px 20px rgba(124,111,255,.3);}
  .btn-retake{width:100%;background:transparent;color:var(--p2);border:1.5px solid var(--p3);padding:10px;border-radius:9px;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
  .btn-retake:hover{background:#1a1840;}

  /* Empty state for years/months with no data */
  .empty-slot{opacity:.4;cursor:not-allowed;}
  .empty-slot:hover{transform:none;box-shadow:none;border-color:var(--b);}
  .coming-soon{font-size:10px;color:var(--t2);font-family:var(--mono);margin-top:6px;}

  /* ── COUNTDOWN ── */
  .cd-wrap{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;gap:16px;}
  .cd-label{font-family:var(--mono);font-size:11px;letter-spacing:4px;color:var(--t2);text-transform:uppercase;animation:fi .4s ease;}
  .cd-num{font-size:clamp(120px,22vw,180px);font-weight:800;line-height:1;color:var(--t);animation:cpop .5s cubic-bezier(.34,1.56,.64,1);letter-spacing:-4px;}
  .cd-num.go{color:var(--p2);}
  @keyframes cpop{0%{transform:scale(.4);opacity:0;}100%{transform:scale(1);opacity:1;}}
  @keyframes fi{from{opacity:0;}to{opacity:1;}}
  @keyframes su{from{transform:translateY(24px);opacity:0;}to{transform:translateY(0);opacity:1;}}
  .cd-ring{position:absolute;border-radius:50%;border:1px solid rgba(124,111,255,.1);animation:rp 1.2s ease-out infinite;}
  .cd-ring:nth-child(1){width:260px;height:260px;}
  .cd-ring:nth-child(2){width:420px;height:420px;animation-delay:.2s;border-color:rgba(124,111,255,.06);}
  .cd-ring:nth-child(3){width:580px;height:580px;animation-delay:.4s;border-color:rgba(124,111,255,.03);}
  @keyframes rp{0%{transform:scale(.85);opacity:0;}100%{transform:scale(1.15);opacity:0;}}

  /* ── QUOTE ── */
  .qt-wrap{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99;padding:40px;text-align:center;gap:20px;}
  .qt-eye{font-family:var(--mono);font-size:10px;letter-spacing:4px;color:var(--p);text-transform:uppercase;animation:fi .6s ease;}
  .qt-bar{width:40px;height:2px;background:var(--p);border-radius:2px;animation:xbar .7s ease forwards;}
  .qt-text{font-family:var(--serif);font-size:clamp(22px,4vw,38px);line-height:1.3;max-width:580px;color:var(--t);animation:su .7s ease;font-style:italic;}
  .qt-author{font-family:var(--mono);font-size:11px;color:var(--t2);letter-spacing:2px;}
  @keyframes xbar{from{width:0;}to{width:40px;}}

  /* ── TEST ── */
  .test-layout{display:grid;grid-template-columns:1fr 252px;gap:24px;align-items:start;}
  @media(max-width:700px){.test-layout{grid-template-columns:1fr;}}
  .test-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--b);flex-wrap:wrap;gap:12px;}
  .test-counter{font-family:var(--mono);font-size:12px;color:var(--t2);}
  .test-counter strong{color:var(--t);font-size:16px;}
  .timer{font-family:var(--mono);font-size:20px;font-weight:700;padding:9px 16px;border-radius:9px;border:1px solid var(--b);background:var(--s1);transition:all .3s;}
  .timer.warn{color:#ff8888;border-color:#ff8888;animation:twarn 1s infinite;}
  @keyframes twarn{0%,100%{box-shadow:0 0 0 rgba(255,136,136,0);}50%{box-shadow:0 0 20px rgba(255,136,136,.25);}}
  .pbar-wrap{height:3px;background:var(--b);border-radius:3px;margin-bottom:22px;}
  .pbar-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--p2));border-radius:3px;transition:width .4s;}
  .q-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;}
  .topic-chip{font-size:10px;font-family:var(--mono);letter-spacing:1px;text-transform:uppercase;color:var(--p2);background:#1a1840;border:1px solid var(--p3);padding:3px 11px;border-radius:100px;}
  .tbadge-mcq{font-size:10px;font-family:var(--mono);font-weight:700;letter-spacing:2px;color:var(--g);background:#0d2018;border:1px solid #1a4030;padding:3px 10px;border-radius:100px;}
  .tbadge-num{font-size:10px;font-family:var(--mono);font-weight:700;letter-spacing:2px;color:var(--y);background:#201800;border:1px solid #403000;padding:3px 10px;border-radius:100px;}
  .btn-review{background:transparent;border:1px solid #3d1a5a;color:var(--pu);padding:5px 12px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .btn-review:hover,.btn-review.active{background:#1e0a30;}
  .q-text{font-size:16px;font-weight:500;line-height:1.8;margin-bottom:22px;color:var(--t);}
  .options{display:flex;flex-direction:column;gap:9px;margin-bottom:18px;}
  .opt{background:var(--s1);border:1.5px solid var(--b);border-radius:11px;padding:13px 16px;text-align:left;cursor:pointer;font-family:var(--font);font-size:14px;color:var(--t);transition:all .15s;display:flex;align-items:center;gap:12px;}
  .opt:hover{border-color:var(--p);background:#16143a;}
  .opt.sel{border-color:var(--p);background:#16143a;}
  .opt-l{font-family:var(--mono);font-size:11px;font-weight:700;width:26px;height:26px;border-radius:6px;background:var(--s2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--t2);transition:all .15s;}
  .opt.sel .opt-l{background:var(--p);color:white;}
  .test-actions{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:18px;}
  .btn-secondary{background:transparent;border:1.5px solid var(--b);color:var(--t2);padding:10px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .btn-secondary:hover{border-color:var(--p2);color:var(--t);}
  .btn-next{background:var(--p);color:white;border:none;padding:10px 26px;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .btn-next:hover{background:var(--p2);}
  .btn-primary{background:var(--p);color:white;border:none;padding:13px 36px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .2s;}
  .btn-primary:hover{background:var(--p2);transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,111,255,.3);}

  /* ── NAVIGATOR ── */
  .nav-panel{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:18px;position:sticky;top:24px;}
  .nav-panel-title{font-size:10px;font-family:var(--mono);color:var(--t2);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;}
  .nav-sec-label{font-size:10px;font-family:var(--mono);letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;margin-top:12px;}
  .nav-sec-label.mcq{color:var(--g);}
  .nav-sec-label.num{color:var(--y);}
  .nav-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;}
  .nb{width:100%;aspect-ratio:1;border-radius:7px;border:1.5px solid var(--b);background:var(--s2);font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;color:var(--t2);}
  .nb.cur{border-color:var(--p);color:var(--p2);background:#16143a;box-shadow:0 0 10px rgba(124,111,255,.25);}
  .nb.sa{background:#0a1f12;border-color:var(--g);color:var(--g);}
  .nb.ss{background:#201000;border-color:var(--or);color:var(--or);}
  .nb.sr{background:#18082a;border-color:var(--pu);color:var(--pu);}
  .nav-counts{display:flex;flex-direction:column;gap:4px;padding:10px 0;border-top:1px solid var(--b);border-bottom:1px solid var(--b);margin:10px 0;}
  .nc-row{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--t2);font-family:var(--mono);}
  .nc-dot{width:7px;height:7px;border-radius:2px;flex-shrink:0;}
  .nav-submit{width:100%;background:var(--p);color:white;border:none;padding:11px;border-radius:9px;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:4px;}
  .nav-submit:hover{background:var(--p2);}

  /* ── RESULTS ── */
  .results{display:flex;flex-direction:column;gap:22px;animation:su .5s ease;}
  .score-hero{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:32px;text-align:center;}
  .score-circle{width:110px;height:110px;border-radius:50%;border:2px solid var(--p);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 16px;background:#16143a;box-shadow:0 0 40px rgba(124,111,255,.15);}
  .score-num{font-family:var(--mono);font-size:36px;font-weight:700;color:var(--p2);line-height:1;}
  .score-total{font-size:11px;color:var(--t2);font-family:var(--mono);}
  .score-title{font-size:20px;font-weight:700;margin-bottom:5px;}
  .score-sub{color:var(--t2);font-size:12px;font-family:var(--mono);}
  .end-quote-box{background:var(--s1);border-left:2px solid var(--p);border-radius:0 10px 10px 0;padding:16px 20px;}
  .end-qt{font-family:var(--serif);font-size:19px;color:var(--t);margin-bottom:5px;line-height:1.35;font-style:italic;}
  .end-sub{font-size:12px;color:var(--p2);font-family:var(--mono);}
  .nudge-card{background:linear-gradient(135deg,#1a1840,#16143a);border:1px solid var(--p3);border-radius:12px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
  .nudge-left{display:flex;flex-direction:column;gap:4px;}
  .nudge-title{font-size:14px;font-weight:700;}
  .nudge-sub{font-size:12px;color:var(--t2);}
  .nudge-best{font-family:var(--mono);font-size:11px;color:var(--p2);}
  .breakdown{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .bcard{background:var(--s1);border:1px solid var(--b);border-radius:11px;padding:15px;text-align:center;}
  .bnum{font-size:24px;font-weight:700;font-family:var(--mono);}
  .blbl{font-size:10px;color:var(--t2);margin-top:3px;text-transform:uppercase;letter-spacing:1px;}
  .gc{color:var(--g);}.rc{color:#ff9999;}.yc{color:var(--y);}
  .section-hdr{font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;font-family:var(--mono);}
  .review-list{display:flex;flex-direction:column;gap:10px;}
  .ritem{background:var(--s1);border:1px solid var(--b);border-radius:11px;padding:16px;}
  .ritem.ci{border-left:2px solid var(--g);}
  .ritem.wi{border-left:2px solid #ff8888;}
  .ritem.si{border-left:2px solid var(--y);}
  .rq{font-size:13px;font-weight:500;margin-bottom:9px;line-height:1.65;}
  .rans{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;}
  .rans span{padding:2px 10px;border-radius:100px;font-family:var(--mono);font-size:11px;}
  .ca{background:#0a1f12;color:var(--g);}
  .wa{background:#1f0a0a;color:#ff9999;}
  .ska{background:#201500;color:var(--y);}
  .sol-box{background:#0a150a;border:1px solid #1a3520;border-radius:9px;padding:13px 15px;margin-top:9px;}
  .sol-hdr{font-size:9px;font-family:var(--mono);color:var(--g);text-transform:uppercase;letter-spacing:2px;margin-bottom:7px;}
  .sol-txt{font-size:13px;color:#7ab87a;line-height:1.7;}
  .ai-box{background:var(--s2);border:1px solid var(--p3);border-radius:9px;padding:14px;margin-top:9px;}
  .ai-hdr{display:flex;align-items:center;gap:7px;margin-bottom:9px;font-size:9px;font-family:var(--mono);color:var(--p2);text-transform:uppercase;letter-spacing:2px;}
  .ai-dot{width:6px;height:6px;border-radius:50%;background:var(--p2);animation:aip 1.5s infinite;}
  @keyframes aip{0%,100%{opacity:1;}50%{opacity:.3;}}
  .ai-txt{font-size:13px;color:var(--t2);line-height:1.75;}
  .btn-ai{background:transparent;border:1px solid var(--p3);color:var(--p2);padding:7px 14px;border-radius:7px;font-size:12px;cursor:pointer;font-family:var(--font);transition:all .15s;margin-top:8px;}
  .btn-ai:hover{background:#1a1640;}
  .btn-ai:disabled{opacity:.4;cursor:not-allowed;}
  .results-actions{display:flex;gap:10px;flex-wrap:wrap;}

  /* ── PROGRESS ── */
  .progress-page{display:flex;flex-direction:column;gap:22px;}
  .pg-title{font-size:18px;font-weight:700;letter-spacing:-.3px;margin-bottom:3px;}
  .pg-sub{font-size:12px;color:var(--t2);font-family:var(--mono);}
  .graph-wrap{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:22px;}
  .graph-lbl{font-size:10px;font-family:var(--mono);color:var(--t2);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;}
  .empty-state{text-align:center;padding:36px;color:var(--t2);font-size:13px;font-family:var(--mono);}
  .topic-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;}
  .topic-card{background:var(--s1);border:1px solid var(--b);border-radius:11px;padding:14px;}
  .topic-name{font-size:12px;font-weight:600;margin-bottom:9px;}
  .tbar-bg{height:5px;background:var(--b);border-radius:3px;}
  .tbar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--p),var(--p2));transition:width .6s;}
  .tpct{font-size:10px;color:var(--t2);margin-top:5px;font-family:var(--mono);}
  .ct{background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:10px 14px;font-family:var(--mono);font-size:12px;}
  .ct-lbl{color:var(--t2);margin-bottom:3px;}
  .ct-val{color:var(--p2);font-weight:700;font-size:14px;}

  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @media(max-width:500px){.breakdown{grid-template-columns:1fr 1fr;}.year-grid{grid-template-columns:repeat(3,1fr);}}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Navigation hierarchy state ──
  // view controls which screen is shown
  const [view, setView]           = useState("years");
  const [selYear, setSelYear]     = useState(null);
  const [selMonth, setSelMonth]   = useState(null);
  const [selShift, setSelShift]   = useState(null);

  // ── Test state ──
  const [screen, setScreen]       = useState(null); // "countdown"|"quote"|"test"|"results"
  const [countNum, setCountNum]   = useState(3);
  const [startQuote, setStartQuote] = useState(null);
  const [answers, setAnswers]     = useState({});
  const [timeLeft, setTimeLeft]   = useState(TOTAL_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent]     = useState(0);
  const [visited, setVisited]     = useState(new Set());
  const [marked, setMarked]       = useState(new Set());
  const [aiTexts, setAiTexts]     = useState({});
  const [aiLoading, setAiLoading] = useState({});

  // ── Progress stored per shift key ──
  const [progress, setProgress]   = useState({});
  const [dbReady, setDbReady]       = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [firestoreQuestions, setFirestoreQuestions] = useState([]);
  const timerRef = useRef(null);

  // ── On mount: seed Firestore + load all saved progress ──
  // useEffect with empty [] runs once when app first loads
  useEffect(() => {
    seedFirestore();
    // Load all progress keys from localStorage as initial state
    const allProgress = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('prog_')) {
        try { allProgress[k.replace('prog_', '')] = JSON.parse(localStorage.getItem(k)); } catch {}
      }
    }
    setProgress(allProgress);
    setDbReady(true);
  }, []);

  // Current questions array
  // QUESTIONS: use Firestore data if loaded, else fallback to local DB
  const QUESTIONS = firestoreQuestions.length > 0
    ? firestoreQuestions
    : (selYear && selMonth && selShift ? DB[selYear]?.[selMonth]?.[selShift]?.questions || [] : []);
  const MCQ_QS = QUESTIONS.filter(q => q.type === "mcq");
  const NUM_QS = QUESTIONS.filter(q => q.type === "num");

  // ── Effects ──
  useEffect(() => {
    if (screen === "test") setVisited(v => new Set([...v, current]));
  }, [current, screen]);

  useEffect(() => {
    if (screen === "test" && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); doSubmit(); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, submitted]);

  useEffect(() => {
    if (screen !== "countdown") return;
    setCountNum(3); let n = 3;
    const iv = setInterval(() => {
      n--;
      if (n === 0) { setCountNum("GO"); clearInterval(iv); setTimeout(() => setScreen("test"), 700); }
      else setCountNum(n);
    }, 900);
    return () => clearInterval(iv);
  }, [screen]);

  useEffect(() => {
    if (screen !== "quote") return;
    const t = setTimeout(() => setScreen("countdown"), 2800);
    return () => clearTimeout(t);
  }, [screen]);

  // ── Actions ──
  const goToYears  = () => { setView("years");  setSelYear(null); setSelMonth(null); setSelShift(null); };
  const goToMonths = (y) => { setSelYear(y);   setSelMonth(null); setSelShift(null); setView("months"); };
  const goToShifts = async (m) => {
    setSelMonth(m); setSelShift(null); setView("shifts");
    // Load progress for each shift in this month from Firestore
    if (selYear && DB[selYear]?.[m]) {
      const updates = {};
      for (const shiftKey of Object.keys(DB[selYear][m])) {
        const key  = progressKey(selYear, m, shiftKey);
        const data = await loadProgressFromFirestore(key);
        if (data) updates[key] = data;
      }
      if (Object.keys(updates).length > 0) setProgress(p => ({ ...p, ...updates }));
    }
  };

  // Load questions from Firestore when a shift is selected
  const loadShiftQuestions = async (year, month, shift) => {
    setLoadingQuestions(true);
    const qs = await loadQuestionsFromFirestore(year, month, shift);
    setFirestoreQuestions(qs);
    setLoadingQuestions(false);
  };

  const beginTest = (shiftKey) => {
    setSelShift(shiftKey);
    setFirestoreQuestions([]); // clear previous shift's questions
    setAnswers({}); setTimeLeft(TOTAL_TIME); setSubmitted(false);
    setCurrent(0); setAiTexts({}); setAiLoading({});
    setVisited(new Set([0])); setMarked(new Set());
    setStartQuote(rand(START_QUOTES));
    setScreen("quote");
    setView("test");
    // Load questions from Firestore in background
    loadShiftQuestions(selYear, selMonth, shiftKey);
  };

  const selectOption = (qi, oi) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qi]: oi }));
    setMarked(m => { const n = new Set(m); n.delete(qi); return n; });
  };

  const toggleMark = () => setMarked(m => {
    const n = new Set(m); if (n.has(current)) n.delete(current); else n.add(current); return n;
  });

  const doSubmit = () => {
    clearInterval(timerRef.current); setSubmitted(true);
    let score = 0, correct = 0, wrong = 0, skipped = 0;
    QUESTIONS.forEach((q, i) => {
      if (answers[i] === undefined) skipped++;
      else if (answers[i] === q.correct) { correct++; score += 4; }
      else { wrong++; if (q.type === "mcq") score -= 1; }
    });
    const result = {
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      score, correct, wrong, skipped,
      total: QUESTIONS.length, maxScore: QUESTIONS.length * 4,
      timeTaken: TOTAL_TIME - timeLeft, answers: { ...answers }
    };
    const key = progressKey(selYear, selMonth, selShift);
    const prev = progress[key] || { attempts: [] };
    const updated = { ...progress, [key]: { ...prev, attempts: [...prev.attempts, result], best: Math.max(result.score, ...(prev.attempts.map(a => a.score))) } };
    setProgress(updated);
    // Save to Firestore + localStorage backup
    saveProgressToFirestore(key, updated[key]);
    setView("results");
  };

  const askAI = async (qi) => {
    const q = QUESTIONS[qi];
    setAiLoading(l => ({ ...l, [qi]: true }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are a JEE Physics expert. Give a clear step-by-step explanation. Simple language, under 120 words. No markdown.",
          messages: [{ role: "user", content: `Q: ${q.question}\nAnswer: ${q.options[q.correct]}\nHint: ${q.solution}\n\nExplain for a JEE student.` }]
        })
      });
      const data = await res.json();
      setAiTexts(a => ({ ...a, [qi]: data.content?.[0]?.text || "Could not load." }));
    } catch { setAiTexts(a => ({ ...a, [qi]: "Could not load explanation." })); }
    setAiLoading(l => ({ ...l, [qi]: false }));
  };

  // ── Derived data ──
  const currentResult = (() => {
    if (view !== "results" || !selYear || !selMonth || !selShift) return null;
    const key = progressKey(selYear, selMonth, selShift);
    const atts = progress[key]?.attempts || [];
    return atts[atts.length - 1] || null;
  })();

  const endQuote = currentResult ? getEndQuote((currentResult.score / currentResult.maxScore) * 100) : null;
  const shiftBest = selYear && selMonth && selShift ? (progress[progressKey(selYear, selMonth, selShift)]?.best ?? null) : null;
  const isNewBest = currentResult && (shiftBest === null || currentResult.score >= shiftBest);

  // Topic accuracy across all attempts for current shift
  const topicStats = {};
  QUESTIONS.forEach(q => { topicStats[q.topic] = { correct: 0, total: 0 }; });
  if (selYear && selMonth && selShift) {
    const key = progressKey(selYear, selMonth, selShift);
    (progress[key]?.attempts || []).forEach(h => {
      QUESTIONS.forEach((q, i) => {
        topicStats[q.topic].total++;
        if (h.answers[i] === q.correct) topicStats[q.topic].correct++;
      });
    });
  }

  // Chart data for current shift
  const chartData = selYear && selMonth && selShift
    ? (progress[progressKey(selYear, selMonth, selShift)]?.attempts || []).map((h, i) => ({ name: `${i + 1}`, score: h.score }))
    : [];

  // Helper: count total questions across a year
  const yearQCount = (y) => {
    let n = 0;
    Object.values(DB[y] || {}).forEach(month =>
      Object.values(month).forEach(shift => {
        n += (shift.questions || []).length;
      })
    );
    return n;
  };

  // Helper: count shifts with data in a month
  const monthShiftCount = (y, m) => Object.values(DB[y]?.[m] || {}).filter(s => s.questions?.length > 0).length;

  // Helper: get shift progress summary
  const shiftProgress = (y, m, s) => {
    const key = progressKey(y, m, s);
    const d = progress[key];
    if (!d || !d.attempts?.length) return null;
    return { attempts: d.attempts.length, best: d.best };
  };

  const answeredCount = Object.keys(answers).length;
  const reviewCount   = marked.size;
  const skippedCount  = [...visited].filter(i => answers[i] === undefined && !marked.has(i)).length;

  // All years available, sorted newest first
  const ALL_YEARS = ["2026","2025","2024","2023","2022","2021","2020","2019"];

  return (
    <>
      <style>{S}</style>

      {/* ── COUNTDOWN ── */}
      {screen === "countdown" && (
        <div className="cd-wrap">
          <div className="cd-ring"/><div className="cd-ring"/><div className="cd-ring"/>
          <div className="cd-label">Get ready</div>
          <div className={`cd-num${countNum === "GO" ? " go" : ""}`}>{countNum}</div>
        </div>
      )}

      {/* ── QUOTE ── */}
      {screen === "quote" && startQuote && (
        <div className="qt-wrap">
          <div className="qt-eye">⚔ Battle Mode</div>
          <div className="qt-bar"/>
          <div className="qt-text">"{startQuote.text}"</div>
          <div className="qt-author">— {startQuote.author}</div>
        </div>
      )}

      {/* ── MAIN UI (not fullscreen screens) ── */}
      {screen !== "countdown" && screen !== "quote" && (
        <div className="app">

          {/* TOP NAV */}
          <nav className="topnav">
            <div className="nav-logo" onClick={goToYears}>RankPilot</div>
            <div className="nav-tabs">
              {view === "results" && <button className="nav-tab active">Results</button>}
              {view === "test" && submitted && <button className="nav-tab" onClick={() => setView("results")}>Results</button>}
              <button className={`nav-tab${view === "progress" ? " active" : ""}`} onClick={() => setView("progress")}>Progress</button>
              <button className={`nav-tab${["years","months","shifts"].includes(view) ? " active" : ""}`} onClick={goToYears}>Tests</button>
            </div>
          </nav>

          {/* BREADCRUMB — shown during test navigation */}
          {["months","shifts","test","results"].includes(view) && (
            <div className="breadcrumb">
              <span className="bc-item" onClick={goToYears}>All Years</span>
              {selYear && <><span className="bc-sep">›</span><span className={`bc-item${view === "months" ? " active" : ""}`} onClick={() => view !== "months" && goToMonths(selYear)}>{selYear}</span></>}
              {selMonth && <><span className="bc-sep">›</span><span className={`bc-item${view === "shifts" ? " active" : ""}`} onClick={() => view !== "shifts" && goToShifts(selMonth)}>{selMonth}</span></>}
              {selShift && <><span className="bc-sep">›</span><span className="bc-item active">{DB[selYear]?.[selMonth]?.[selShift]?.label} · {DB[selYear]?.[selMonth]?.[selShift]?.date}</span></>}
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: YEARS
          ════════════════════════════════════════ */}
          {view === "years" && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">JEE Main PYQ</div>
                <div className="sel-sub">Physics · Select a year to begin</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:dbReady?"var(--g)":"var(--y)",animation:dbReady?"none":"aip 1.5s infinite"}}/>
                  <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)",letterSpacing:1}}>{dbReady?"FIREBASE CONNECTED":"CONNECTING..."}</span>
                </div>
              </div>
              <div className="year-grid">
                {ALL_YEARS.map(y => {
                  const hasData = !!DB[y] && yearQCount(y) > 0;
                  const qCount  = yearQCount(y);
                  return (
                    <div key={y} className={`year-card${hasData ? " has-data" : " empty-slot"}`} onClick={() => hasData && goToMonths(y)}>
                      {hasData && <div className="year-badge">AVAILABLE</div>}
                      <div className="year-num">{y}</div>
                      {hasData
                        ? <div className="year-count">{qCount} questions</div>
                        : <div className="coming-soon">Coming soon</div>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: MONTHS
          ════════════════════════════════════════ */}
          {view === "months" && selYear && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">JEE Main {selYear}</div>
                <div className="sel-sub">Select an exam date</div>
              </div>
              <div className="month-grid">
                {Object.keys(DB[selYear] || {}).map(m => {
                  const shiftCount = monthShiftCount(selYear, m);
                  const totalQ = Object.values(DB[selYear][m]).reduce((acc, s) => acc + (s.questions?.length || 0), 0);
                  return (
                    <div key={m} className="month-card has-data" onClick={() => goToShifts(m)}>
                      <div className="month-name">{m}</div>
                      <div className="month-info">
                        <div className="month-shifts">{shiftCount} shift{shiftCount > 1 ? "s" : ""} · {totalQ} questions</div>
                        <div className="month-pill">{selYear}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: SHIFTS
          ════════════════════════════════════════ */}
          {view === "shifts" && selYear && selMonth && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">{selMonth} {selYear}</div>
                <div className="sel-sub">Select a shift to start the test</div>
              </div>
              <div className="shift-grid">
                {Object.entries(DB[selYear][selMonth]).map(([shiftKey, shift]) => {
                  const prog = shiftProgress(selYear, selMonth, shiftKey);
                  const mcqCount = (shift.questions || []).filter(q => q.type === "mcq").length;
                  const numCount = (shift.questions || []).filter(q => q.type === "num").length;
                  return (
                    <div key={shiftKey} className={`shift-card${prog ? " completed" : ""}`}>
                      <div className="shift-top">
                        <div className="shift-label">{shift.label}</div>
                        <div className="shift-date">{shift.date} {selYear}</div>
                      </div>
                      <div className="shift-stats">
                        <div className="shift-stat"><span>{shift.questions?.length || 0}</span> questions</div>
                        <div className="shift-stat"><span style={{color:"var(--g)"}}>MCQ</span> {mcqCount}</div>
                        <div className="shift-stat"><span style={{color:"var(--y)"}}>NUM</span> {numCount}</div>
                        <div className="shift-stat">⏱ <span>60</span> min</div>
                      </div>
                      {prog && (
                        <div className="shift-score">
                          <div>
                            <div className="shift-score-lbl">Best score</div>
                            <div className="shift-score-acc">{prog.attempts} attempt{prog.attempts > 1 ? "s" : ""}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div className="shift-score-val">{prog.best}</div>
                            <div className="shift-score-acc">/ {(shift.questions?.length || 0) * 4} pts</div>
                          </div>
                        </div>
                      )}
                      {prog
                        ? <button className="btn-retake" onClick={() => beginTest(shiftKey)}>Retake Test →</button>
                        : <button className="btn-start" onClick={() => beginTest(shiftKey)}>Start Test →</button>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: TEST
          ════════════════════════════════════════ */}
          {view === "test" && (
            <div className="test-layout">
              {loadingQuestions && (
                <div style={{position:"fixed",inset:0,background:"rgba(9,9,15,.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50,gap:16}}>
                  <div style={{width:40,height:40,border:"3px solid var(--p3)",borderTop:"3px solid var(--p2)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",letterSpacing:2}}>LOADING FROM FIRESTORE...</div>
                </div>
              )}
              <div>
                <div className="test-header">
                  <div className="test-counter">Question <strong>{current + 1}</strong> of {QUESTIONS.length}</div>
                  <div className={`timer${timeLeft < 180 ? " warn" : ""}`}>{fmt(timeLeft)}</div>
                </div>
                <div className="pbar-wrap"><div className="pbar-fill" style={{width:`${((current+1)/QUESTIONS.length)*100}%`}}/></div>
                <div className="q-meta">
                  <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                    <span className="topic-chip">{QUESTIONS[current]?.topic}</span>
                    <span className={QUESTIONS[current]?.type === "mcq" ? "tbadge-mcq" : "tbadge-num"}>{QUESTIONS[current]?.type === "mcq" ? "MCQ" : "NUM"}</span>
                  </div>
                  <button className={`btn-review${marked.has(current) ? " active" : ""}`} onClick={toggleMark}>{marked.has(current) ? "★ Marked" : "☆ Review"}</button>
                </div>
                <p className="q-text">{QUESTIONS[current]?.question}</p>
                <div className="options">
                  {(QUESTIONS[current]?.options || []).map((opt, oi) => (
                    <button key={oi} className={`opt${answers[current] === oi ? " sel" : ""}`} onClick={() => selectOption(current, oi)}>
                      <span className="opt-l">{["A","B","C","D"][oi]}</span>{opt}
                    </button>
                  ))}
                </div>
                <div className="test-actions">
                  <button className="btn-secondary" onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current === 0}>← Prev</button>
                  {current < QUESTIONS.length - 1
                    ? <button className="btn-next" onClick={() => setCurrent(c => c+1)}>Next →</button>
                    : <button className="btn-next" onClick={doSubmit}>Finish & Submit →</button>
                  }
                </div>
              </div>

              <div className="nav-panel">
                <div className="nav-panel-title">Navigator</div>
                <div className="nav-sec-label mcq">Section A — MCQ ({MCQ_QS.length})</div>
                <div className="nav-grid">
                  {QUESTIONS.map((q, i) => q.type !== "mcq" ? null : (
                    <button key={i} className={`nb s${getStatus(i,answers,visited,marked)}${i===current?" cur":""}`} onClick={() => setCurrent(i)}>{i+1}</button>
                  ))}
                </div>
                <div className="nav-sec-label num">Section B — NUM ({NUM_QS.length})</div>
                <div className="nav-grid">
                  {QUESTIONS.map((q, i) => q.type !== "num" ? null : (
                    <button key={i} className={`nb s${getStatus(i,answers,visited,marked)}${i===current?" cur":""}`} onClick={() => setCurrent(i)}>{i+1}</button>
                  ))}
                </div>
                <div className="nav-counts">
                  <div className="nc-row"><div className="nc-dot" style={{background:"var(--g)"}}/>{answeredCount} answered</div>
                  <div className="nc-row"><div className="nc-dot" style={{background:"var(--or)"}}/>{skippedCount} skipped</div>
                  <div className="nc-row"><div className="nc-dot" style={{background:"var(--pu)"}}/>{reviewCount} for review</div>
                </div>
                <button className="nav-submit" onClick={doSubmit}>Submit Test</button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: RESULTS
          ════════════════════════════════════════ */}
          {view === "results" && currentResult && (
            <div className="results">
              <div className="score-hero">
                <div className="score-circle">
                  <div className="score-num">{currentResult.score}</div>
                  <div className="score-total">/ {currentResult.maxScore}</div>
                </div>
                <div className="score-title">{currentResult.score>=80?"Excellent! 🔥":currentResult.score>=50?"Good effort 👊":"Keep going 💪"}</div>
                <div className="score-sub">Accuracy: {Math.round((currentResult.correct/currentResult.total)*100)}% · Time: {fmt(currentResult.timeTaken)}</div>
              </div>

              {endQuote && <div className="end-quote-box"><div className="end-qt">"{endQuote.text}"</div><div className="end-sub">{endQuote.sub}</div></div>}

              <div className="nudge-card">
                <div className="nudge-left">
                  <div className="nudge-title">{isNewBest ? "🏆 New personal best!" : `Can you beat ${shiftBest} pts?`}</div>
                  <div className="nudge-sub">{isNewBest ? "You just set a new record. Now defend it." : "One more attempt — you're closer than you think."}</div>
                  {!isNewBest && <div className="nudge-best">Best: {shiftBest} pts · This: {currentResult.score} pts</div>}
                </div>
                <button className="btn-primary" onClick={() => beginTest(selShift)}>Try Again →</button>
              </div>

              <div className="breakdown">
                <div className="bcard"><div className="bnum gc">{currentResult.correct}</div><div className="blbl">Correct</div></div>
                <div className="bcard"><div className="bnum rc">{currentResult.wrong}</div><div className="blbl">Wrong</div></div>
                <div className="bcard"><div className="bnum yc">{currentResult.skipped}</div><div className="blbl">Skipped</div></div>
              </div>

              <div>
                <div className="section-hdr">Review All Questions</div>
                <div className="review-list">
                  {QUESTIONS.map((q, i) => {
                    const ans = currentResult.answers[i], isC = ans===q.correct, isS = ans===undefined;
                    return (
                      <div key={i} className={`ritem ${isS?"si":isC?"ci":"wi"}`}>
                        <div style={{display:"flex",gap:6,marginBottom:7,flexWrap:"wrap"}}>
                          <span className={q.type==="mcq"?"tbadge-mcq":"tbadge-num"}>{q.type.toUpperCase()}</span>
                          <span className="topic-chip">{q.topic}</span>
                          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)",padding:"3px 8px",background:"var(--s2)",borderRadius:100}}>{selYear} {selMonth} {DB[selYear]?.[selMonth]?.[selShift]?.label}</span>
                        </div>
                        <div className="rq">Q{i+1}. {q.question}</div>
                        <div className="rans">
                          <span className="ca">✓ {q.options[q.correct]}</span>
                          {!isS&&!isC&&<span className="wa">✗ {q.options[ans]}</span>}
                          {isS&&<span className="ska">Skipped</span>}
                        </div>
                        <div className="sol-box"><div className="sol-hdr">Solution</div><div className="sol-txt">{q.solution}</div></div>
                        {!aiTexts[i]
                          ?<button className="btn-ai" onClick={()=>askAI(i)} disabled={aiLoading[i]}>{aiLoading[i]?"✦ Loading...":"✦ Explain with AI"}</button>
                          :<div className="ai-box"><div className="ai-hdr"><div className="ai-dot"/>AI Explanation</div><div className="ai-txt">{aiTexts[i]}</div></div>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="results-actions">
                <button className="btn-primary" onClick={() => beginTest(selShift)}>Take Again →</button>
                <button className="btn-secondary" onClick={() => setView("shifts")}>← Back to Shifts</button>
                <button className="btn-secondary" onClick={() => setView("progress")}>Progress</button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: PROGRESS
          ════════════════════════════════════════ */}
          {view === "progress" && (
            <div className="progress-page">
              <div><div className="pg-title">Your Progress</div><div className="pg-sub">All attempts across shifts</div></div>

              {/* Score chart for current shift if selected */}
              {selYear && selMonth && selShift && chartData.length > 0 && (
                <div className="graph-wrap">
                  <div className="graph-lbl">{selYear} {selMonth} {DB[selYear]?.[selMonth]?.[selShift]?.label} — Score History</div>
                  {chartData.length === 1
                    ? <div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontFamily:"var(--mono)",fontSize:28,fontWeight:700,color:"var(--p2)"}}>{chartData[0].score}</div><div style={{fontSize:12,color:"var(--t2)",marginTop:4,fontFamily:"var(--mono)"}}>First attempt</div></div>
                    : <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}>
                          <XAxis dataKey="name" tick={{fill:"#6868a0",fontSize:11}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:"#6868a0",fontSize:11}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          {shiftBest && <ReferenceLine y={shiftBest} stroke="#a89dff" strokeDasharray="4 4" strokeWidth={1}/>}
                          <Line type="monotone" dataKey="score" stroke="#7c6fff" strokeWidth={2} dot={{fill:"#a89dff",r:4,strokeWidth:0}} activeDot={{r:6,fill:"#a89dff"}}/>
                        </LineChart>
                      </ResponsiveContainer>
                  }
                </div>
              )}

              {/* Summary across all shifts */}
              <div>
                <div className="section-hdr">All Shifts Attempted</div>
                {Object.keys(progress).length === 0
                  ? <div className="empty-state">No tests taken yet. Pick a year and start.</div>
                  : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {Object.entries(progress).map(([key, data]) => {
                        if (!data.attempts?.length) return null;
                        const [y, m, s] = key.split("_");
                        const shiftLabel = DB[y]?.[m]?.[s]?.label || s;
                        return (
                          <div key={key} style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                            <div>
                              <div style={{fontSize:13,fontWeight:600}}>{y} · {m} · {shiftLabel}</div>
                              <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:3}}>{data.attempts.length} attempt{data.attempts.length>1?"s":""}</div>
                            </div>
                            <div style={{display:"flex",gap:16,alignItems:"center"}}>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:700,color:"var(--p2)"}}>{data.best}</div>
                                <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>best score</div>
                              </div>
                              <button className="btn-retake" style={{width:"auto",padding:"8px 16px"}} onClick={() => { setSelYear(y); setSelMonth(m); beginTest(s); }}>Retake</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                }
              </div>

              {/* Topic accuracy */}
              {selYear && selMonth && selShift && Object.values(topicStats).some(s => s.total > 0) && (
                <div>
                  <div className="section-hdr">Accuracy by Topic — {selYear} {selMonth} {DB[selYear]?.[selMonth]?.[selShift]?.label}</div>
                  <div className="topic-grid">
                    {Object.entries(topicStats).filter(([,s]) => s.total > 0).map(([topic, stat]) => {
                      const pct = Math.round((stat.correct/stat.total)*100);
                      return (
                        <div key={topic} className="topic-card">
                          <div className="topic-name">{topic}</div>
                          <div className="tbar-bg"><div className="tbar-fill" style={{width:`${pct}%`}}/></div>
                          <div className="tpct">{pct}% accuracy</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={goToYears}>← Browse All Tests</button>
            </div>
          )}

        </div>
      )}
    </>
  );
}
