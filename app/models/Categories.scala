package models


object Categories extends Enumeration {
  type Category = Value
  val Home, Bills, Food, Shopping, Transport, Other = Value

  def getAll = List(Home, Bills, Food, Shopping, Transport, Other)

  def retrieveFromString(string: String) = string match {
    case "Home" => Home
    case "Bills" => Bills
    case "Food" => Food
    case "Shopping" => Shopping
    case "Transport" => Transport
    case _ => Other
  }
}
