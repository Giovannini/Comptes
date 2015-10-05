package controllers

import models.Releve
import models.db.ReleveTableImpl
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}


object StatsController extends Controller {

  def index = Action {
    Ok(views.html.stats.stats())
  }

  def getLastMonthHistory = Action {
    Ok(Json.obj("history" -> ReleveTableImpl.getLastMonthHistory))
  }

  def getMonthlyAverageSpending = Action {
    val monthlyAverage = ReleveTableImpl.getAll
      .filter(_.date.isBefore(DateTime.now.withDayOfMonth(1)))
      .groupBy(_.category)
      .map{ case (category, releves) => (category.toString, computeMonthlyAverage(releves)) }
    println(Json.toJson(monthlyAverage))
    Ok(Json.obj("monthlyAverage" -> Json.toJson(monthlyAverage)))
  }

  private def computeMonthlyAverage(releves: List[Releve]): Double = {
    val dailyBalance = releves.groupBy(r => r.date.getMonthOfYear + "/" + r.date.getYear)
      .mapValues(Releve.balance)
      .values
    dailyBalance.sum / dailyBalance.size
  }

}
