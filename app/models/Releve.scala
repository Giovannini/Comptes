package models

import models.db.ReleveTable
import org.joda.time.format.ISODateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.Logger
import play.api.libs.functional.syntax._
import play.api.libs.json._

import scala.util.{Failure, Success, Try}


case class Releve(date: DateTime,
                  description: String,
                  montant: Double,
                  debit: Boolean = true,
                  category: Categories.Value){

  def toWritable: String = {
    Json.stringify(Json.toJson(this)) + "\n"
  }

  def wasDuring(month: Int, year: Int) = date.getMonthOfYear == month && date.getYear == year

  def price: Double = {if(debit) -1 else 1} * montant
}

object Releve extends ReleveTable {

  implicit val dateFormat = ISODateTimeFormat.dateTime().withZone(DateTimeZone.getDefault)

  implicit val format: Format[Releve] = (
    (JsPath \ "date").format[String].inmap[DateTime](dateFormat.parseDateTime, _.toString) and
      (JsPath \ "description").format[String] and
      (JsPath \ "amount").format[Double] and
      (JsPath \ "debit").format[Boolean] and
      (JsPath \ "category").format[String].inmap[Categories.Value](Categories.retrieveFromString, _.toString)
    )(Releve.apply, unlift(Releve.unapply))

  def parseJson(json: String): Option[Releve] = Try(Json.parse(json)) match {
    case Success(o) => o.validate[Releve].fold(
        error => None,
        success => Some(success)
      )
    case Failure(e) =>
      Logger.error("Mauvais parsing...", e)
      None
  }

}