# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

User.create!(
  username: "guest_user",
	password: "guestguest",
	expertise: "Jet Propulsion",
)

User.create!(
  username: "EngineerGuy",
	password: "engiguy",
	expertise: "Electrical Engineering",
)

User.create!(
  username: "CSPro",
	password: "computerscience",
	expertise: "Computer Science",
)

Article.create!(
  title: "Rocket Engines",
  body: "A rocket engine is a type of jet engine that uses only stored rocket propellant mass for forming its high speed propulsive jet. Rocket engines are reaction engines, obtaining thrust in accordance with Newton's third law. Most rocket engines are internal combustion engines, although non-combusting forms (such as cold gas thrusters) also exist. Vehicles propelled by rocket engines are commonly called rockets. Since they need no external material to form their jet, rocket engines can perform in a vacuum and thus can be used to propel spacecraft and ballistic missiles. Compared to other types of jet engines, rocket engines have the highest thrust, are by far the lightest, but are the least propellant efficient (have the lowest specific impulse). The ideal exhaust is hydrogen, the lightest of all gases, but chemical rockets produce a mix of heavier species, reducing the exhaust velocity. Rocket engines become more efficient at high velocities (due to greater propulsive efficiency and Oberth effect). Since they do not require an atmosphere, they are well suited for uses at very high altitude and in space.",
	image_link: "https://en.wikipedia.org/wiki/File:RS-68_rocket_engine_test.jpg",
	background_link: "https://en.wikipedia.org/wiki/File:Viking_5C_rocketengine.jpg",
  author_id: 1,
  locked: false,
)

Article.create!(
  title: "Specific Impulse",
  body: "Specific impulse (usually abbreviated Isp) is a measure of the efficiency of rocket and jet engines. By definition, it is the total impulse (or change in momentum) delivered per unit of propellant consumed, and is dimensionally equivalent to the thrust generated divided by the propellant flow rate. If mass (kilogram or slug) is used as the unit of propellant, then specific impulse has units of velocity. If weight (newton or pound) is used instead, then specific impulse has units of time (seconds). Multiplying by the gravitational constant (g0) converts it from the weight basis to the mass basis. A propulsion method and system with a higher specific impulse uses the mass or weight of the propellant more efficiently in creating forward thrust, and in the case of a rocket, the less propellant needed for a given delta-v, per the Tsiolkovsky rocket equation. In rockets, this does necessarily mean the engine is more efficient at gaining altitude, distance, or velocity. This is because if an engine burns the propellant faster, the rocket has less weight for a longer period of time, which makes better use of the total force times time that was acquired from the propellant. This is much less of a consideration in jet engines that employ wings and outside air for combustion to carry payloads that are much heavier than the propellant. Specific impulse includes the contribution to impulse provided by external air that has been used for combustion and is exhausted with the spent propellant. Jet engines using outside air therefore have a much higher specific impulse than rocket engines. The specific impulse in terms of propellant mass spent (multiplying the weight-based Isp in seconds by g0) is in units of distance per time which is an artificial velocity called the 'effective exhaust velocity'. This is higher than the actual exhaust velocity because the mass of the combustion air is not being accounted for. Actual and effective exhaust velocity are the same in rocket engines not utilizing air. Specific impulse is inversely proportional to specific fuel consumption by the relationship Isp=1/(go*SFC) for SFC in kg/N-s and Isp = 3600/SFC for SFC in lb/lbf-hr.",
	image_link: "https://en.wikipedia.org/wiki/File:Specific-impulse-kk-20090105.png",
  author_id: 1,
  locked: false,
)

Article.create!(
  title: "Electrical Engineering",
  body: "Electrical engineering is a field of engineering that generally deals with the study and application of electricity, electronics, and electromagnetism. This field first became an identifiable occupation in the latter half of the 19th century after commercialization of the electric telegraph, the telephone, and electric power distribution and use. Subsequently, broadcasting and recording media made electronics part of daily life. The invention of the transistor, and later the integrated circuit, brought down the cost of electronics to the point they can be used in almost any household object. Electrical engineering has now subdivided into a wide range of subfields including electronics, digital computers, power engineering, telecommunications, control systems, radio-frequency engineering, signal processing, instrumentation, and microelectronics. The subject of electronic engineering is often treated as its own subfield but it intersects with all the other subfields, including the power electronics of power engineering. Electrical engineers typically hold a degree in electrical engineering or electronic engineering. Practicing engineers may have professional certification and be members of a professional body. Such bodies include the Institute of Electrical and Electronics Engineers (IEEE) and the Institution of Engineering and Technology (professional society) (IET). Electrical engineers work in a very wide range of industries and the skills required are likewise variable. These range from basic circuit theory to the management skills required of a project manager. The tools and equipment that an individual engineer may need are similarly variable, ranging from a simple voltmeter to a top end analyzer to sophisticated design and manufacturing software.",
	image_link: "https://en.wikipedia.org/wiki/File:Power_plant.jpg",
	background_link: "https://en.wikipedia.org/wiki/File:Silego_clock_generator.JPG",
  author_id: 2,
  locked: false,
)

Article.create!(
  title: "Electromagnetism",
  body: "Electromagnetism is a branch of physics which involves the study of the electromagnetic force, a type of physical interaction that occurs between electrically charged particles. The electromagnetic force usually shows electromagnetic fields, such as electric fields, magnetic fields, and light. The electromagnetic force is one of the four fundamental interactions in nature. The other three fundamental interactions are the strong interaction, the weak interaction, and gravitation. The word electromagnetism is a compound form of two Greek terms, ἤλεκτρον, ēlektron, 'amber', and μαγνῆτις λίθος magnētis lithos, which means 'magnesian stone', a type of iron ore. The science of electromagnetic phenomena is defined in terms of the electromagnetic force, sometimes called the Lorentz force, which includes both electricity and magnetism as elements of one phenomenon. The electromagnetic force plays a major role in determining the internal properties of most objects encountered in daily life. Ordinary matter takes its form as a result of intermolecular forces between individual molecules in matter. Electrons are bound by electromagnetic wave mechanics into orbitals around atomic nuclei to form atoms, which are the building blocks of molecules. This governs the processes involved in chemistry, which arise from interactions between the electrons of neighboring atoms, which are in turn determined by the interaction between electromagnetic force and the momentum of the electrons. There are numerous mathematical descriptions of the electromagnetic field. In classical electrodynamics, electric fields are described as electric potential and electric current. In Faraday's law, magnetic fields are associated with electromagnetic induction and magnetism, and Maxwell's equations describe how electric and magnetic fields are generated and altered by each other and by charges and currents. The theoretical implications of electromagnetism, in particular the establishment of the speed of light based on properties of the 'medium' of propagation (permeability and permittivity), led to the development of special relativity by Albert Einstein in 1905. Although electromagnetism is considered one of the four fundamental forces, at high energy the weak force and electromagnetism are unified. In the history of the universe, during the quark epoch, the electroweak force split into the electromagnetic and weak forces.",
	image_link: "https://en.wikipedia.org/wiki/File:VFPt_Solenoid_correct2.svg",
	background_link: "https://en.wikipedia.org/wiki/File:Lightning.0257.jpg",
  author_id: 2,
  locked: false,
)

//

Article.create!(
  title: "JavaScript",
  body: "JavaScript is a high-level, dynamic, untyped, and interpreted programming language. It has been  standardized in the ECMAScript language specification. Alongside HTML and CSS, it is one of the three essential technologies of World Wide Web content production; the majority of websites employ it and it is supported by all modern Web browsers without plug-ins. JavaScript is prototype-based with first-class functions, making it a multi-paradigm language, supporting object-oriented, imperative, and functional programming styles. It has an API for working with text, arrays, dates and regular expressions, but does not include any I/O, such as networking, storage, or graphics facilities, relying for these upon the host environment in which it is embedded. Despite some naming, syntactic, and standard library similarities, JavaScript and Java are otherwise unrelated and have very different semantics. The syntax of JavaScript is actually derived from C, while the semantics and design are influenced by the Self and Scheme programming languages. JavaScript is also used in environments that are not Web-based, such as PDF documents, site-specific browsers, and desktop widgets. Newer and faster JavaScript virtual machines (VMs) and platforms built upon them have also increased the popularity of JavaScript for server-side Web applications. On the client side, JavaScript has been traditionally implemented as an interpreted language, but more recent browsers perform just-in-time compilation. It is also used in game development, the creation of desktop and mobile applications, and server-side network programming with runtime environments such as Node.js.",
  author_id: 3,
  locked: false,
)

Article.create!(
  title: "Just-in-time compilation",
  body: "In computing, just-in-time (JIT) compilation, also known as dynamic translation, is compilation done during execution of a program – at run time – rather than prior to execution. Most often this consists of translation to machine code, which is then executed directly, but can also refer to translation to another format. JIT compilation is a combination of the two traditional approaches to translation to machine code – ahead-of-time compilation (AOT), and interpretation – and combines some advantages and drawbacks of both. Roughly, JIT compilation combines the speed of compiled code with the flexibility of interpretation, with the overhead of an interpreter and the additional overhead of compiling (not just interpreting). JIT compilation is a form of dynamic compilation, and allows adaptive optimization such as dynamic recompilation – thus in theory JIT compilation can yield faster execution than static compilation. Interpretation and JIT compilation are particularly suited for dynamic programming languages, as the runtime system can handle late-bound data types and enforce security guarantees.",
  author_id: 3,
  locked: false,
)

Comment.create!(
  body: "Great article!",
	user_id: "2",
	article_id: "1",
)

Comment.create!(
  body: "This is a comment",
	user_id: "3",
	article_id: "1",
)

Comment.create!(
  body: "Thanks",
	user_id: "1",
	article_id: "1",
)

Comment.create!(
  body: "I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste! I wrote a really long angry comment with copy paste!",
	user_id: "3",
	article_id: "2",
)

Comment.create!(
  body: "Come check out my article",
	user_id: "2",
	article_id: "3",
)

Comment.create!(
  body: "Test comment",
	user_id: "1",
	article_id: "4",
)

Comment.create!(
  body: "Article 5 has a comment",
	user_id: "1",
	article_id: "5",
)

Annotation.create!(
  body: "This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. This is going to be a really long annotation. ",
	author_id: "1",
	article_id: "1",
  selection_start: 0,
  selection_length: 150
)

Annotation.create!(
  body: "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.",
	author_id: "2",
	article_id: "1",
  selection_start: 250,
  selection_length: 350
)


Improvement.create!(
  body: "Inaccurate description",
	user_id: "1",
	annotation_id: "1",
)

Improvement.create!(
  body: "This is too complex",
	user_id: "3",
	annotation_id: "1",
)

Improvement.create!(
  body: "Need more detail",
	user_id: "1",
	annotation_id: "1",
)
