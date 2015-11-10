package controllers

import javax.inject.Inject

import models.Releve
import models.db.ReleveTable
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}


class StatsController @Inject()(releveTable: ReleveTable) extends Controller {

  def index = Action {
    Ok(views.html.stats.stats())
  }

  def getLastMonthHistory = Action {
    Ok(Json.obj("history" -> releveTable.getLastMonthHistory))
  }

  def getMonthlyAverageSpending = Action {
    val monthlyAverage = releveTable.getAll
      .filter(_.date.isBefore(DateTime.now.withDayOfMonth(1)))
      .groupBy(_.category)
      .map{ case (category, releves) => (category.toString, computeMonthlyAverage(releves)) }
    println(Json.toJson(monthlyAverage))
    Ok(Json.obj("monthlyAverage" -> Json.toJson(monthlyAverage)))
  }

  private def computeMonthlyAverage(releves: List[Releve]): Double = {
    val dailyBalance = releves.groupBy(_.date.toString("MM/yyyy"))
      .mapValues(Releve.balance)
      .values
    dailyBalance.sum / dailyBalance.size
  }

}
