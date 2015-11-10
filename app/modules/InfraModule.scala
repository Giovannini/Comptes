package modules

import com.google.inject.AbstractModule
import models.db.{ReleveTable, ReleveTableImpl}

class InfraModule extends AbstractModule {
  def configure() = {
    bind(classOf[ReleveTable])
      .to(classOf[ReleveTableImpl])
  }
}
