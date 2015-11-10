package utils

import java.io.File
import javax.inject.Inject

import models.Categories.Category
import models.db.ReleveTable
import models.{Categories, Releve}
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import play.api.libs.json.{JsObject, Json}

class StatisticsHelper @Inject()(releveTable: ReleveTable){

  val dateStringFormat: DateTimeFormatter = DateTimeFormat.forPattern("dd/MM/yyyy")

  def file(month: Int, year: Int) = new File(s"comptes_$month$year")

  def getAll(month:Int, year:Int): List[Releve] = releveTable.getAll(month, year)

  def getBalance(releves: List[Releve]): Double = {
    releves.map(_.price).sum
  }

  def getMoneyEarnedMonthly(month: Int, year: Int): Double = {
    releveTable.getAll(month, year).filterNot(_.debit).map(_.price).sum
  }

  def getMoneySpentMonthly(month: Int, year: Int): Double = {
    releveTable.getAll(month, year).filter(_.debit).map(_.price).sum
  }

  def getMonthlyBalance(month: Int, year: Int): Double = getBalance {
    releveTable.getAll(month, year)
  }

  private def getMonthlyBalanceAt(date: DateTime, releves: List[Releve]): Double = getBalance {
    releves.filter(_.date isBefore date)
  }

  def getMonthlyBalancePlots(month: Int, year: Int): List[JsObject] = {
    val lastDay = dateStringFormat.parseDateTime(s"01/$month/$year").dayOfMonth().getMaximumValue
    val releves = releveTable.getAll(month, year)
    (1 to lastDay).toList
      .map { dayNumber =>
      val day = dateStringFormat.parseDateTime(s"$dayNumber/$month/$year")
//      getMonthlyBalanceAt(day, releves)
      Json.obj("x" -> dayNumber, "y" ->getMonthlyBalanceAt(day, releves))
    }
  }

  def getTop(month: Int, year: Int, number: Int)(f: Releve => Boolean) = releveTable.getAll(month, year)
    .filter(f)
    .sortBy(_.montant)
    .take(number)

  def getTopLosses(month: Int, year: Int, number: Int) = getTop(month, year, number)(releve => releve.debit)

  def getTopGain(month: Int, year: Int, number: Int) = getTop(month, year, number)(releve => !releve.debit)


  def getBalanceByCategory(category: Category, releves: List[Releve]) = getBalance {
    releves.filter(_.category == category)
  }

  def getCategoryPieData(month: Int, year: Int): List[JsObject] = {
    val releves = releveTable.getAll(month, year).filter(_.debit)
    Categories.getAll.map { category =>
      Json.obj("category" -> category.toString, "value" -> getBalanceByCategory(category, releves))
    }
  }

}
