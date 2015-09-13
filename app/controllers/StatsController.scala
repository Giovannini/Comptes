package controllers

import org.joda.time.DateTime
import play.api.libs.json.{JsString, Json, JsNumber}
import play.api.mvc.{Action, Controller}
import utils.StatisticsHelper


object StatsController extends Controller {

  private def month = DateTime.now().getMonthOfYear

  private def year = DateTime.now().getYear

  def getStats(month: Int = month, year: Int = year) = Action {
    Ok(Json.obj(
      "stats" -> Json.obj(
        "mois" -> JsString(s"$month/$year"),
        "releves" -> StatisticsHelper.getAll(month, year)
      )))
  }

  def getBalanceByMonth(month: Int = month, year: Int = year) = Action {
    Ok(JsNumber(StatisticsHelper.getMonthlyBalance(month, year)))
  }

  def getPlots(month: Int = month, year: Int = year) = Action {
    Ok(Json.obj("amounts" -> StatisticsHelper.getMonthlyBalancePlots(month, year)))
  }

}
