package models.db

import java.io.{File, FileWriter}

import models.Releve
import org.joda.time.DateTime

import scala.io.Source
import scala.util.{Failure, Success, Try}

object ReleveTableImpl extends ReleveTable

trait ReleveTable {

  private def file(month: Int, year: Int): File = {
    val now = DateTime.now
    val (month, year) = (now.getMonthOfYear, now.getYear)
    new File(s"releves/comptes_$month$year")
  }

  private def file(date: DateTime): File = {
    file(date.getMonthOfYear, date.getYear)
  }

  def insert(releve: Releve): Boolean = {
    val f = file(releve.date)
    if(!f.exists()) f.mkdir()
    val fw = new FileWriter(f, true)
    Try(fw.write(releve.toWritable)) match {
      case Success(_) =>
        fw.close()
        true
      case Failure(_) =>
        fw.close()
        false
    }
  }

  def getAll(month: Int, year: Int): List[Releve] = {
    val f = file(month, year)
    if(!f.exists()) {
      println("No such file")
      f.createNewFile()
      Nil
    } else Source.fromFile(f)
      .getLines()
      .flatMap(Releve.parseJson)
      .toList
  }

  def getAll(date: DateTime): List[Releve] = {
    getAll(date.getMonthOfYear, date.getYear)
  }

}

