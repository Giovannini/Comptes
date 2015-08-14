package models


object Categories extends Enumeration {
  type Category = Value
  val Home, BillsAndUtilities, FoodAndDrinks, Shopping, AutoAndTransport, Other = Value
}
