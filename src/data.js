// ─── QUESTIONS DATABASE ─────────────────────────────────────────────────────
// DB is now namespaced by subject: DB[subject][year][month][shift]
// Physics data below is UNCHANGED from the original — only nested one level
// deeper under the "Physics" key so Chemistry/Mathematics can have their own
// independent year/month/shift trees without colliding with Physics.
const DB = {
  Physics: {
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
  },

  // ─── Chemistry — placeholder data, same structure as Physics ───────────────
  // Replace these placeholder questions with real PYQs whenever ready; the
  // shape (label/date/totalQ/questions[]) must stay identical to Physics.
  Chemistry: {
    "2026": {
      "April 2nd": {
        "S1": {
          label: "Shift 1", date: "2nd Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Physical Chemistry", question:"[Placeholder] Which of the following best describes the rate law for a first-order reaction?", options:["Rate = k[A]²","Rate = k[A]","Rate = k","Rate = k[A][B]"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Inorganic Chemistry", question:"[Placeholder] Which element has the electronic configuration 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹?", options:["Sodium","Potassium","Calcium","Magnesium"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Organic Chemistry", question:"[Placeholder] Which functional group is present in an aldehyde?", options:["-COOH","-CHO","-OH","-NH₂"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Physical Chemistry", question:"[Placeholder] If 2 moles of an ideal gas occupy 44.8 L at STP, the value of n is ___.", options:["2","1","4","3"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        },
        "S2": {
          label: "Shift 2", date: "2nd Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Inorganic Chemistry", question:"[Placeholder] Which of the following is a noble gas?", options:["Chlorine","Argon","Sulfur","Phosphorus"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Organic Chemistry", question:"[Placeholder] Which reaction converts an alkene to an alcohol?", options:["Hydrogenation","Hydration","Halogenation","Oxidation"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Physical Chemistry", question:"[Placeholder] The SI unit of molar concentration is:", options:["g/L","mol/L","mol/kg","mol"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Inorganic Chemistry", question:"[Placeholder] The atomic number of Carbon is ___.", options:["6","8","12","14"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        }
      },
      "April 4th": {
        "S1": {
          label: "Shift 1", date: "4th Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Organic Chemistry", question:"[Placeholder] Which of these is an example of a nucleophile?", options:["H⁺","NH₃","BF₃","AlCl₃"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Physical Chemistry", question:"[Placeholder] Which law relates pressure and volume of a gas at constant temperature?", options:["Charles' Law","Boyle's Law","Gay-Lussac's Law","Avogadro's Law"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Inorganic Chemistry", question:"[Placeholder] Which of the following is the most electronegative element?", options:["Oxygen","Nitrogen","Fluorine","Chlorine"], correct:2, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Physical Chemistry", question:"[Placeholder] The pH of a neutral solution at 25°C is ___.", options:["7","0","14","1"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        },
        "S2": {
          label: "Shift 2", date: "4th Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Organic Chemistry", question:"[Placeholder] Which of the following is an example of an isomer pair?", options:["Methane & Ethane","Butane & Isobutane","Propane & Pentane","Ethanol & Methanol"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Inorganic Chemistry", question:"[Placeholder] Which of the following is a transition metal?", options:["Sodium","Calcium","Iron","Aluminium"], correct:2, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Physical Chemistry", question:"[Placeholder] Which of the following best describes an exothermic reaction?", options:["Absorbs heat","Releases heat","No heat change","Releases light only"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Organic Chemistry", question:"[Placeholder] The number of carbon atoms in propane is ___.", options:["3","2","4","5"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        }
      }
    }
  },

  // ─── Mathematics — placeholder data, same structure as Physics ─────────────
  Mathematics: {
    "2026": {
      "April 2nd": {
        "S1": {
          label: "Shift 1", date: "2nd Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Algebra", question:"[Placeholder] The roots of x² − 5x + 6 = 0 are:", options:["1, 6","2, 3","−2, −3","2, −3"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Calculus", question:"[Placeholder] The derivative of sin(x) with respect to x is:", options:["−cos(x)","cos(x)","−sin(x)","tan(x)"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Coordinate Geometry", question:"[Placeholder] The distance between points (0,0) and (3,4) is:", options:["5","7","6","4"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Algebra", question:"[Placeholder] The value of log₂(8) is ___.", options:["3","2","4","8"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        },
        "S2": {
          label: "Shift 2", date: "2nd Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Trigonometry", question:"[Placeholder] The value of sin(90°) is:", options:["0","1","−1","1/2"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Calculus", question:"[Placeholder] The integral of 1/x dx is:", options:["x²/2","ln|x| + C","1/x² + C","eˣ + C"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Probability", question:"[Placeholder] The probability of getting heads on a fair coin toss is:", options:["1","0.5","0.25","0"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Algebra", question:"[Placeholder] The sum of the first 5 natural numbers is ___.", options:["15","10","20","25"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        }
      },
      "April 4th": {
        "S1": {
          label: "Shift 1", date: "4th Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Matrices", question:"[Placeholder] The determinant of a 2×2 identity matrix is:", options:["0","1","2","−1"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Coordinate Geometry", question:"[Placeholder] The slope of the line y = 3x + 2 is:", options:["2","3","−3","1/3"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Calculus", question:"[Placeholder] The derivative of x³ with respect to x is:", options:["3x","3x²","x²","2x³"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Algebra", question:"[Placeholder] The number of roots of a quadratic equation is ___.", options:["2","1","3","0"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        },
        "S2": {
          label: "Shift 2", date: "4th Apr", totalQ: 4,
          questions: [
            { id:1, type:"mcq", topic:"Permutations & Combinations", question:"[Placeholder] The value of 5! (5 factorial) is:", options:["100","120","60","20"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:2, type:"mcq", topic:"Vectors", question:"[Placeholder] The magnitude of vector (3,4) is:", options:["7","5","12","1"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:3, type:"mcq", topic:"Trigonometry", question:"[Placeholder] The value of cos(0°) is:", options:["0","1","−1","1/2"], correct:1, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
            { id:4, type:"num", topic:"Calculus", question:"[Placeholder] The value of d/dx(constant) is ___.", options:["0","1","x","constant"], correct:0, solution:"Placeholder solution — replace with real explanation once actual PYQ is added." },
          ]
        }
      }
    }
  }
};

export default DB
