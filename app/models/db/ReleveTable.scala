package models.db

import better.files._
import models.Releve
import org.joda.time.DateTime
import play.api.libs.json.{JsObject, Json}

class ReleveTableImpl extends ReleveTable {
  val f: File = home / "Documents" / "projects" / "Comptes" / "releves" / "comptes"
}

object ReleveTableMock extends ReleveTable {
  val f: File = home / "Documents" / "projects" / "Comptes" / "releves" / "fake_comptes"
}

trait ReleveTable {

  implicit val ordering = new Ordering[DateTime] {
    override def compare(x: DateTime, y: DateTime): Int = -x.compareTo(y)
  }

  val f: File

  private def comptes: File = {
    if (!f.exists) f.touch() else f
  }

  def insert(releve: Releve): Unit = {
    comptes.append(releve.toWritable)
  }

  def getAll(month: Int, year: Int): List[Releve] = getAllRelevesWithCondition(_.wasDuring(month, year))

  def getLastMonthHistory: List[JsObject] = {
    val lastMonth = DateTime.now.minusMonths(1)
    val (previousReleves, lastMonthReleves) = partitionReleves(_.date.isBefore(lastMonth))
    val balanceAtStart = Releve.balance(previousReleves)
    lastMonthReleves.groupBy(_.date)
      .toList
      .sortBy(_._1)
      .foldLeft(List((lastMonth, balanceAtStart))) { case (list, (date, releves)) =>
        (date, Releve.balance(releves) + list.head._2) :: list
      }
      .map { case (date, montant) =>
        Json.obj("date" -> date.getDayOfMonth, "montant" -> montant)
      }
  }

  def getAll: List[Releve] = comptes.lines
    .flatMap(Releve.parseJson)
    .toList

  def getPastWeek = getAllRelevesWithCondition { releve =>
    val now = DateTime.now().minusWeeks(1)
    releve.date.getWeekOfWeekyear == now.getWeekOfWeekyear &&
      releve.date.getWeekyear == now.getWeekyear
  }

  def getAllRelevesWithCondition(condition: Releve => Boolean): List[Releve] = getAll.filter(condition)

  private def partitionReleves(condition: Releve => Boolean): (List[Releve], List[Releve]) = getAll.partition(condition)

}

