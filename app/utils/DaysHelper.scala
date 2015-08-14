package utils

object DaysHelper {

  def numberOfDaysInMonth(month: Int, year: Int) = month match {
    case 2 => if(year % 4 == 0) 28 else 29
    case 1 | 3 | 5 | 7 | 8 | 10 | 12 => 31
    case _ => 30
  }

}
