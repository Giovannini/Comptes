package utils

import java.io.File

import models.Releve
import models.db.ReleveTableImpl
import org.joda.time.DateTime

object StatisticsHelper {

  def file(month: Int, year: Int) = new File(s"comptes_$month$year")

  def getMonthlyBalance(month: Int, year: Int) = {
    ReleveTableImpl.getAll(month, year)
      .map(_.price).sum
  }

  def getMonthlyBalanceAt(date: DateTime): Double = ReleveTableImpl.getAll(date)
    .filter(_.date isAfter date)
    .map(_.price).sum

  def getMonthlyBalancePlots(month: Int, year: Int): List[Double] = {
    val lastDay = DateTime.parse(s"01/$month/$year").dayOfMonth().getMaximumValue
    (1 to lastDay).toList
      .map { dayNumber =>
      val day = DateTime.parse(s"$dayNumber/$month/$year")
      getMonthlyBalanceAt(day)
    }
  }


  def getTop(month: Int, year: Int, number: Int)(f: Releve => Boolean) = ReleveTableImpl.getAll(month, year)
    .filter(f)
    .sortBy(_.montant)
    .take(number)

  def getTopLosses(month: Int, year: Int, number: Int) = getTop(month, year, number)(releve => releve.debit)

  def getTopGain(month: Int, year: Int, number: Int) = getTop(month, year, number)(releve => !releve.debit)

}
