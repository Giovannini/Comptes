name := "Comptes"

version := "1.0"

lazy val `comptes` = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

resolvers ++= Seq(
  "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/"
)

libraryDependencies ++= Seq( jdbc, cache , ws ,
  "org.slf4j" % "slf4j-nop" % "1.6.4",
  "org.scalatest" %% "scalatest" % "2.2.4" % "test"
)

unmanagedResourceDirectories in Test <+=  baseDirectory ( _ / "target/web/public/test" )