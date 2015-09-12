package models


object Categories extends Enumeration {
  type Category = Value
  val Home, BillsAndUtilities, FoodAndDrinks, Shopping, AutoAndTransport, Other = Value

  def getAll = List(Home, BillsAndUtilities, FoodAndDrinks, Shopping, AutoAndTransport, Other)

  def retrieveFromString(string: String) = string match {
    case "Home" => Home
    case "BillsAndUtilities" => BillsAndUtilities
    case "FoodAndDrinks" => FoodAndDrinks
    case "Shopping" => Shopping
    case "AutoAndTransport" => AutoAndTransport
    case _ => Other
  }
}
