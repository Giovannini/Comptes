package controllers

import models.Releve
import org.joda.time.DateTime
import play.api.libs.json.{JsError, Json}
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  def getReleves = Action {
    Ok(Json.obj("releves" -> Releve.getAll(DateTime.now).map(releve => Json.toJson(releve))))
  }

  def addReleve() = Action(parse.json) { request =>
    request.body.validate[Releve].fold(
      error => BadRequest(JsError.toJson(error)),
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