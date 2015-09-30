package models.db

import better.files._
import models.Releve
import org.joda.time.DateTime

object ReleveTableImpl extends ReleveTable

trait ReleveTable {

  val f = home/"Documents"/"projects"/"Comptes"/"releves"/"fake_comptes"

  private def comptes: File = {
    if(! f.exists) f.touch() else f
  }

  def insert(releve: Releve): Unit = {
    comptes.append(releve.toWritable)
  }

  def getAll(month: Int, year: Int): List[Releve] = comptes.lines
    .flatMap(Releve.parseJson)
    .filter(_.wasDuring(month, year))
    .toList

  def getAll(date: DateTime): List[Releve] = {
    getAll(date.getMonthOfYear, date.getYear)
  }

}

