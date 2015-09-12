package controllers

import org.joda.time.DateTime
import play.api.libs.json.{Json, JsNumber}
import play.api.mvc.{Action, Controller}
import utils.StatisticsHelper


object StatsController extends Controller{

  private def month = DateTime.now().getMonthOfYear
  private def year = DateTime.now().getYear

  def getBalanceByMonth(month: Int = month, year: Int = year) = Action {
    Ok(JsNumber(StatisticsHelper.getMonthlyBalance(month, year)))
  }

  def getPlots(month: Int = month, year: Int = year) = Action {
    Ok(Json.obj("amounts" -> StatisticsHelper.getMonthlyBalancePlots(month, year)))
  }
  
}
