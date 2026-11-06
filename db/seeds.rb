# Idempotent: safe to run on every deploy. Records are matched on natural keys
# (username, article title, annotation offsets, ...) and linked through
# associations, never hardcoded ids. Content ported from the 2016 seed data.
#
# The guest password is intentionally public (demo account behind the
# "Log In as Guest" button). The persona accounts only own seed content, so
# they get random passwords: their legacy passwords are public in git history.

users = [
  { username: User::GUEST_USERNAME, password: "guestguest", expertise: "Jet Propulsion" },
  { username: "EngineerGuy", password: SecureRandom.base58(24), expertise: "Electrical Engineering" },
  { username: "CSPro", password: SecureRandom.base58(24), expertise: "Computer Science" },
  { username: "TheRocketeer", password: SecureRandom.base58(24), expertise: "Rocket Science" }
].to_h do |attrs|
  user = User.find_or_create_by!(username: attrs[:username]) do |u|
    u.password = attrs[:password]
    u.expertise = attrs[:expertise]
  end
  [ user.username, user ]
end

articles = [
  {
    title: "Rocket Engines",
    user: "guest_user",
    image_link: "http://res.cloudinary.com/eli5ience/image/upload/v1457331760/RS-68_rocket_engine_test_fbi4t8.jpg",
    body: "A rocket engine is a type of jet engine that uses only stored rocket propellant mass for forming its high speed propulsive jet. Rocket engines are reaction engines, obtaining thrust in accordance with Newton's third law. Most rocket engines are internal combustion engines, although non-combusting forms (such as cold gas thrusters) also exist. Vehicles propelled by rocket engines are commonly called rockets. Since they need no external material to form their jet, rocket engines can perform in a vacuum and thus can be used to propel spacecraft and ballistic missiles. Compared to other types of jet engines, rocket engines have the highest thrust, are by far the lightest, but are the least propellant efficient (have the lowest specific impulse). The ideal exhaust is hydrogen, the lightest of all gases, but chemical rockets produce a mix of heavier species, reducing the exhaust velocity. Rocket engines become more efficient at high velocities (due to greater propulsive efficiency and Oberth effect). Since they do not require an atmosphere, they are well suited for uses at very high altitude and in space."
  },
  {
    title: "Specific Impulse",
    user: "guest_user",
    image_link: "http://res.cloudinary.com/eli5ience/image/upload/v1457331760/Specific-impulse-kk-20090105_oclhgn.png",
    body: "Specific impulse (usually abbreviated Isp) is a measure of the efficiency of rocket and jet engines. By definition, it is the total impulse (or change in momentum) delivered per unit of propellant consumed, and is dimensionally equivalent to the thrust generated divided by the propellant flow rate. If mass (kilogram or slug) is used as the unit of propellant, then specific impulse has units of velocity. If weight (newton or pound) is used instead, then specific impulse has units of time (seconds). Multiplying by the gravitational constant (g0) converts it from the weight basis to the mass basis. A propulsion method and system with a higher specific impulse uses the mass or weight of the propellant more efficiently in creating forward thrust, and in the case of a rocket, the less propellant needed for a given delta-v, per the Tsiolkovsky rocket equation. In rockets, this does necessarily mean the engine is more efficient at gaining altitude, distance, or velocity. This is because if an engine burns the propellant faster, the rocket has less weight for a longer period of time, which makes better use of the total force times time that was acquired from the propellant. This is much less of a consideration in jet engines that employ wings and outside air for combustion to carry payloads that are much heavier than the propellant. Specific impulse includes the contribution to impulse provided by external air that has been used for combustion and is exhausted with the spent propellant. Jet engines using outside air therefore have a much higher specific impulse than rocket engines. The specific impulse in terms of propellant mass spent (multiplying the weight-based Isp in seconds by g0) is in units of distance per time which is an artificial velocity called the 'effective exhaust velocity'. This is higher than the actual exhaust velocity because the mass of the combustion air is not being accounted for. Actual and effective exhaust velocity are the same in rocket engines not utilizing air. Specific impulse is inversely proportional to specific fuel consumption by the relationship Isp=1/(go*SFC) for SFC in kg/N-s and Isp = 3600/SFC for SFC in lb/lbf-hr."
  },
  {
    title: "Electrical Engineering",
    user: "EngineerGuy",
    image_link: "http://res.cloudinary.com/eli5ience/image/upload/v1457331760/Power_plant_klhgh5.jpg",
    body: "Electrical engineering is a field of engineering that generally deals with the study and application of electricity, electronics, and electromagnetism. This field first became an identifiable occupation in the latter half of the 19th century after commercialization of the electric telegraph, the telephone, and electric power distribution and use. Subsequently, broadcasting and recording media made electronics part of daily life. The invention of the transistor, and later the integrated circuit, brought down the cost of electronics to the point they can be used in almost any household object. Electrical engineering has now subdivided into a wide range of subfields including electronics, digital computers, power engineering, telecommunications, control systems, radio-frequency engineering, signal processing, instrumentation, and microelectronics. The subject of electronic engineering is often treated as its own subfield but it intersects with all the other subfields, including the power electronics of power engineering. Electrical engineers typically hold a degree in electrical engineering or electronic engineering. Practicing engineers may have professional certification and be members of a professional body. Such bodies include the Institute of Electrical and Electronics Engineers (IEEE) and the Institution of Engineering and Technology (professional society) (IET). Electrical engineers work in a very wide range of industries and the skills required are likewise variable. These range from basic circuit theory to the management skills required of a project manager. The tools and equipment that an individual engineer may need are similarly variable, ranging from a simple voltmeter to a top end analyzer to sophisticated design and manufacturing software."
  },
  {
    title: "Electromagnetism",
    user: "EngineerGuy",
    image_link: "http://res.cloudinary.com/eli5ience/image/upload/v1457331760/490px-VFPt_Solenoid_correct2.svg_k0e7ru.png",
    body: "Electromagnetism is a branch of physics which involves the study of the electromagnetic force, a type of physical interaction that occurs between electrically charged particles. The electromagnetic force usually shows electromagnetic fields, such as electric fields, magnetic fields, and light. The electromagnetic force is one of the four fundamental interactions in nature. The other three fundamental interactions are the strong interaction, the weak interaction, and gravitation. The word electromagnetism is a compound form of two Greek terms, ἤλεκτρον, ēlektron, 'amber', and μαγνῆτις λίθος magnētis lithos, which means 'magnesian stone', a type of iron ore. The science of electromagnetic phenomena is defined in terms of the electromagnetic force, sometimes called the Lorentz force, which includes both electricity and magnetism as elements of one phenomenon. The electromagnetic force plays a major role in determining the internal properties of most objects encountered in daily life. Ordinary matter takes its form as a result of intermolecular forces between individual molecules in matter. Electrons are bound by electromagnetic wave mechanics into orbitals around atomic nuclei to form atoms, which are the building blocks of molecules. This governs the processes involved in chemistry, which arise from interactions between the electrons of neighboring atoms, which are in turn determined by the interaction between electromagnetic force and the momentum of the electrons. There are numerous mathematical descriptions of the electromagnetic field. In classical electrodynamics, electric fields are described as electric potential and electric current. In Faraday's law, magnetic fields are associated with electromagnetic induction and magnetism, and Maxwell's equations describe how electric and magnetic fields are generated and altered by each other and by charges and currents. The theoretical implications of electromagnetism, in particular the establishment of the speed of light based on properties of the 'medium' of propagation (permeability and permittivity), led to the development of special relativity by Albert Einstein in 1905. Although electromagnetism is considered one of the four fundamental forces, at high energy the weak force and electromagnetism are unified. In the history of the universe, during the quark epoch, the electroweak force split into the electromagnetic and weak forces."
  },
  {
    title: "JavaScript",
    user: "CSPro",
    image_link: "http://res.cloudinary.com/eli5ience/image/upload/v1457331760/js-logo-badge-512_g9b3fk.png",
    body: "JavaScript is a high-level, dynamic, untyped, and interpreted programming language. It has been  standardized in the ECMAScript language specification. Alongside HTML and CSS, it is one of the three essential technologies of World Wide Web content production; the majority of websites employ it and it is supported by all modern Web browsers without plug-ins. JavaScript is prototype-based with first-class functions, making it a multi-paradigm language, supporting object-oriented, imperative, and functional programming styles. It has an API for working with text, arrays, dates and regular expressions, but does not include any I/O, such as networking, storage, or graphics facilities, relying for these upon the host environment in which it is embedded. Despite some naming, syntactic, and standard library similarities, JavaScript and Java are otherwise unrelated and have very different semantics. The syntax of JavaScript is actually derived from C, while the semantics and design are influenced by the Self and Scheme programming languages. JavaScript is also used in environments that are not Web-based, such as PDF documents, site-specific browsers, and desktop widgets. Newer and faster JavaScript virtual machines (VMs) and platforms built upon them have also increased the popularity of JavaScript for server-side Web applications. On the client side, JavaScript has been traditionally implemented as an interpreted language, but more recent browsers perform just-in-time compilation. It is also used in game development, the creation of desktop and mobile applications, and server-side network programming with runtime environments such as Node.js."
  },
  {
    title: "Just-in-time compilation",
    user: "CSPro",
    body: "In computing, just-in-time (JIT) compilation, also known as dynamic translation, is compilation done during execution of a program – at run time – rather than prior to execution. Most often this consists of translation to machine code, which is then executed directly, but can also refer to translation to another format. JIT compilation is a combination of the two traditional approaches to translation to machine code – ahead-of-time compilation (AOT), and interpretation – and combines some advantages and drawbacks of both. Roughly, JIT compilation combines the speed of compiled code with the flexibility of interpretation, with the overhead of an interpreter and the additional overhead of compiling (not just interpreting). JIT compilation is a form of dynamic compilation, and allows adaptive optimization such as dynamic recompilation – thus in theory JIT compilation can yield faster execution than static compilation. Interpretation and JIT compilation are particularly suited for dynamic programming languages, as the runtime system can handle late-bound data types and enforce security guarantees."
  }
]

articles = articles.to_h do |attrs|
  article = Article.find_or_create_by!(title: attrs[:title]) do |a|
    a.user = users.fetch(attrs[:user])
    a.image_link = attrs[:image_link]
    a.body = attrs[:body]
  end
  [ article.title, article ]
end

comments = [
  [ "Rocket Engines", "EngineerGuy", "Great article!" ],
  [ "Rocket Engines", "CSPro", "I'd love to see some more annotations on this!" ],
  [ "Rocket Engines", "guest_user", "Thanks" ],
  [ "Specific Impulse", "CSPro", "This article is very interesting." ],
  [ "Specific Impulse", "guest_user", "Merge this with Rocket Engines?" ],
  [ "Electrical Engineering", "EngineerGuy", "Come check out my article" ],
  [ "Electrical Engineering", "CSPro", "I'd like to see more like this." ],
  [ "Electrical Engineering", "guest_user", "Excellent!" ],
  [ "Electromagnetism", "guest_user", "Wow!" ],
  [ "JavaScript", "guest_user", "I'll share this with friends." ],
  [ "JavaScript", "CSPro", "This is relevant to my interests." ],
  [ "Just-in-time compilation", "guest_user", "This is very well written." ],
  [ "Just-in-time compilation", "EngineerGuy", "I don't understand this at all. Need more annotations." ],
  [ "Just-in-time compilation", "TheRocketeer", "First." ]
]

comments.each do |title, username, body|
  article = articles.fetch(title)
  Comment.find_or_create_by!(article: article, user: users.fetch(username), body: body)
end

# Offsets are UTF-16 code units into the article body (see docs/api.md). The
# legacy offsets were computed with JS indexOf, which counts the same units, so
# they port unchanged; db/seeds is checked against the new validations in
# test/integration/seeds_test.rb.
annotations = [
  [ "Rocket Engines", "TheRocketeer", 994, 13,
    "A maneuver in which a rocket falls into a gravitational well, and then accelerates when its fall reaches maximum speed." ],
  [ "Rocket Engines", "EngineerGuy", 0, 221,
    "A garden hose shows how moving fluid can create a force. When a hose is turned up the hose will snake around unless it is held still. The exiting water is creating a force on the hose just like how the rocket engine gases push on the rocket engine." ],
  [ "Specific Impulse", "TheRocketeer", 0, 299,
    "Specific impulse is a useful value to compare rocket or jet engines. It is used much like miles per gallon or liters per 100 kilometers is used to compare cars. An engine with a higher specific impulse uses fuel better. This means that the same amount of fuel lets the rocket go faster after all fuel is depleted." ],
  [ "Specific Impulse", "guest_user", 603, 580,
    "A rocket engine with a higher specific impulse doesn't mean it's 'more powerful'. That is, it will not make the rocket accelerate harder. In fact, the designs for engines with the highest specific impulse, like ion engines, are the 'weakest' of all types of engines. They accelerate the rocket slowly but steadily over a long period of time using only a tiny amount of fuel." ],
  [ "Electrical Engineering", "EngineerGuy", 0, 151,
    "Electrical engineers are engineers who develop (think and make) different things that use electricity in a helpful way. They fix or design new and better ways of using devices that use electricity." ],
  [ "Electromagnetism", "guest_user", 1489, 409,
    "Electric fields can be drawn as arrows. The arrows point which way a positive particle, like a proton, will be pushed if it's in the field. Negative particles, like electrons, will go in the opposite direction as the arrows. In an electric field, arrows will point away from positive particles, and towards negative ones. So, a proton in an electric field would move away from another proton, or towards an electron." ],
  [ "JavaScript", "guest_user", 16, 10,
    "A programming language is \"high-level\" when it hides or takes care of some programming details, making the process of developing a program simpler and more understandable relative to a lower-level language." ],
  [ "JavaScript", "CSPro", 162, 4,
    "HyperText Markup Language, commonly referred to as HTML, is the standard language used to create web pages." ],
  [ "JavaScript", "CSPro", 171, 3,
    "Cascading Style Sheets (CSS) is a style sheet language used for describing the presentation of a document written in a markup language." ],
  [ "Just-in-time compilation", "guest_user", 322, 151,
    "AOT versus interpretation is like translating an entire book to another language versus translating individual sentences of a book to another language." ],
  [ "Rocket Engines", "EngineerGuy", 305, 26,
    "Compressed air, for example." ],
  [ "Rocket Engines", "CSPro", 572, 180,
    "Go as fast as possible as quickly as possible." ],
  [ "Specific Impulse", "TheRocketeer", 309, 16,
    "The slug is a unit of mass associated with Imperial units and United States customary units. It is a mass that accelerates by 1 ft/s2 when a force of one pound (lbF) is exerted on it. One slug has a mass of 32.174049 lbm or 14.593903 kg based on standard gravity, the international foot, and the avoirdupois pound." ],
  [ "Specific Impulse", "guest_user", 522, 22,
    "gravitational constant = 6.67408 × 10-11 m3 kg-1 s-2" ],
  [ "Electrical Engineering", "TheRocketeer", 1303, 4,
    "Institute of Electrical and Electronics Engineers" ],
  [ "Electrical Engineering", "EngineerGuy", 1034, 20,
    "Probably would have been better off as mechanical engineers." ],
  [ "Electrical Engineering", "guest_user", 433, 165,
    "To say the least!" ],
  [ "Electromagnetism", "guest_user", 549, 8,
    "Amber in Greek, as the article states" ],
  [ "Electromagnetism", "EngineerGuy", 72, 21,
    "The force of electromanetisim" ],
  [ "Electromagnetism", "guest_user", 295, 80,
    "Articles on the other three fundamental interactions are coming soon!" ],
  [ "JavaScript", "guest_user", 117, 10,
    "ECMAScript (or ES) is a trademarked scripting-language specification standardized by Ecma International in ECMA-262 and ISO/IEC 16262. Well-known implementations of the language, such as JavaScript, JScript and ActionScript have come into wide use for client-side scripting on the Web." ],
  [ "JavaScript", "guest_user", 260, 169,
    "Meaning, it's awesome." ],
  [ "Just-in-time compilation", "guest_user", 136, 8,
    "In a reduced version that can be run but not changed." ]
]

annotations.each do |title, username, start, length, body|
  article = articles.fetch(title)
  Annotation.find_by(article: article, selection_start: start, selection_length: length) ||
    Annotation.create_serialized!(article: article, user: users.fetch(username),
      selection_start: start, selection_length: length, body: body)
end

# [ article title, annotation selection_start, username, body ]
improvements = [
  [ "Rocket Engines", 994, "guest_user", "Inaccurate description" ],
  [ "Rocket Engines", 994, "CSPro", "This is too complex" ],
  [ "Rocket Engines", 994, "guest_user", "Need more detail" ],
  [ "Rocket Engines", 0, "TheRocketeer", "Do you have a source for this?" ],
  [ "Specific Impulse", 0, "CSPro", "This is misleading" ],
  [ "Specific Impulse", 603, "TheRocketeer", "Great explanation!" ],
  [ "Electrical Engineering", 0, "guest_user", "Can you expand on this, please?" ],
  [ "Electromagnetism", 1489, "CSPro", "Thanks!" ],
  [ "JavaScript", 16, "guest_user", "Needs more detail" ],
  [ "JavaScript", 162, "guest_user", "Too dense." ],
  [ "JavaScript", 162, "guest_user", "I like this explanation" ],
  [ "JavaScript", 171, "guest_user", "Needs more detail" ],
  [ "Just-in-time compilation", 322, "guest_user", "Too dense." ],
  [ "Rocket Engines", 305, "guest_user", "I like this explanation" ],
  [ "Rocket Engines", 572, "guest_user", "Inaccurate description" ],
  [ "Specific Impulse", 309, "CSPro", "This is too complex" ],
  [ "Specific Impulse", 522, "guest_user", "Need more detail" ],
  [ "Electrical Engineering", 1303, "TheRocketeer", "Do you have a source for this?" ],
  [ "Specific Impulse", 603, "CSPro", "This is misleading" ],
  [ "Specific Impulse", 0, "TheRocketeer", "Great explanation!" ],
  [ "Rocket Engines", 0, "guest_user", "Can you expand on this, please?" ],
  [ "Electrical Engineering", 1034, "CSPro", "Thanks!" ]
]

improvements.each do |title, start, username, body|
  annotation = articles.fetch(title).annotations.find_by!(selection_start: start)
  Improvement.find_or_create_by!(annotation: annotation, user: users.fetch(username), body: body)
end
