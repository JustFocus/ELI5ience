# Idempotent: safe to run on every deploy. Usernames and expertise come from
# db/legacy_seeds.rb. Articles and the rest are ported in a later step.
#
# The guest password is intentionally public (demo account behind the
# "Log In as Guest" button). The persona accounts only own seed content, so
# they get random passwords: their legacy passwords are public in git history.
[
  { username: User::GUEST_USERNAME, password: "guestguest", expertise: "Jet Propulsion" },
  { username: "EngineerGuy", password: SecureRandom.base58(24), expertise: "Electrical Engineering" },
  { username: "CSPro", password: SecureRandom.base58(24), expertise: "Computer Science" },
  { username: "TheRocketeer", password: SecureRandom.base58(24), expertise: "Rocket Science" }
].each do |attrs|
  User.find_or_create_by!(username: attrs[:username]) do |user|
    user.password = attrs[:password]
    user.expertise = attrs[:expertise]
  end
end
