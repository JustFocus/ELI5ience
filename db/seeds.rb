# Idempotent: safe to run on every deploy. Usernames, expertise and passwords
# come from db/legacy_seeds.rb. Articles and the rest are ported in a later step.
[
  { username: User::GUEST_USERNAME, password: "guestguest", expertise: "Jet Propulsion" },
  { username: "EngineerGuy", password: "engiguy", expertise: "Electrical Engineering" },
  { username: "CSPro", password: "computerscience", expertise: "Computer Science" },
  { username: "TheRocketeer", password: "getmeahelmet", expertise: "Rocket Science" }
].each do |attrs|
  User.find_or_create_by!(username: attrs[:username]) do |user|
    user.password = attrs[:password]
    user.expertise = attrs[:expertise]
  end
end
