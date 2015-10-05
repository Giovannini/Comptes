package controllers

import models.Releve
import models.db.ReleveTableImpl
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json.{JsError, Json}
import play.api.mvc._

import scala.util.{Failure, Success, Try}

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  def getReleves = Action {
    val lastMonth = DateTime.now.minusMonths(1)
    val releves = ReleveTableImpl.getAllRelevesWithCondition(_.date.isAfter(lastMonth))
    Ok(Json.obj("releves" -> releves))
  }

  def addReleve() = Action(parse.json) { request =>
    request.body.validate[Releve].fold(
      error => BadRequest(JsError.toJson(error)),
      releve => Try(ReleveTableImpl.insert(releve)) match {
        case Success(_) =>  Ok("L'insertion a été réalisée avec succès.")
        case Failure(e) =>
          Logger.error(s"Erreur lors de l'insertion du nouveau releve $releve", e)
          InternalServerError
      }
    )
  }

  def addReleveForm() = Action {
    Ok(views.html.forms.addReleveForm.addReleveForm())
  }

}