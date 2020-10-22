import {BehaviorSubject} from 'rxjs';
import {StudyClass} from '../models/study-class';

export class CloneClassService {
  classToBeCloned: BehaviorSubject<StudyClass> = new BehaviorSubject<StudyClass>(new StudyClass({}));

  public setClassObject(classToBeCloned: StudyClass) {
    console.log('--> ', classToBeCloned)
    this.classToBeCloned.next(classToBeCloned);
  }
}
