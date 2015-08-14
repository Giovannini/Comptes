package models

import models.db.ReleveTable
import org.joda.time.format.DateTimeFormat
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, Format, JsPath}


case class Releve(private val _date: String, description: String, montant: Double, debit: Boolean = true){

  private val formatter = DateTimeFormat.forPattern("dd/MM/yyyy")

  val date = formatter.parseDateTime(_date)

  def toWritable: String = Json.stringify(Json.toJson(this)) + "\n"

  def price: Double = {if(debit) 1 else -1} * montant
}

object Releve extends ReleveTable {

  implicit val format: Format[Releve] = (
    (JsPath \ "date").format[String] and
      (JsPath \ "description").format[String] and
      (JsPath \ "amount").format[Double] and
      (JsPath \ "debit").format[Boolean]
    )(Releve.apply, unlift(Releve.unapply))

  def parseJson(json: String): Option[Releve] = Json.parse(json).validate[Releve].asOpt

}