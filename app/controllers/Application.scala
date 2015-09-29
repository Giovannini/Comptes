package controllers

import models.Releve
import org.joda.time.DateTime
import play.api.libs.json.{JsError, Json}
import play.api.mvc._

import scala.util.{Success, Try}

object Application extends Controller {

  def index = Action {
    val now = DateTime.now
    val releves = Releve.getAll(now.getMonthOfYear, now.getYear)
    Ok(views.html.index(Json.stringify(Json.obj("releves" -> releves))))
  }

  def getReleves = Action {
    val now = DateTime.now
    val releves = Releve.getAll(now.getMonthOfYear, now.getYear)
    Ok(Json.obj(
      "releves" -> releves
    ))
  }

  def addReleve() = Action(parse.json) { request =>
    request.body.validate[Releve].fold(
      error => BadRequest(JsError.toJson(error)),
      releve => Try(Releve.insert(releve)) match {
        case Success(_) =>  Ok("L'insertion a été réalisée avec succès.")
        case _ => InternalServerError
      }
    )
  }

  def addReleveForm() = Action {
    Ok(views.html.forms.addReleveForm.addReleveForm())
  }

}