package controllers

import models.Releve
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.json.{Writes, JsError, Json}
import play.api.mvc._

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
      error => BadRequest(JsError.toFlatJson(error)),
      releve => {
        if(Releve.insert(releve)) Ok("L'insertion a été réalisée avec succès.")
        else InternalServerError
      }
    )
  }

  def addReleveForm() = Action {
    Ok(views.html.forms.addReleveForm.addReleveForm())
  }

}