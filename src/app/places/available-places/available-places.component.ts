import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  isFetching = signal(false);
  error = signal('');
  
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.httpClient.get<{ places: Place[] }>('http://localhost:3000/places')
    .pipe(map((restData) => restData.places), catchError((error) => throwError(() => new Error('Something went wrong fetching the available places'))))
    .subscribe(
      { next: (places) => this.places.set(places),
        complete: () => this.isFetching.set(false),
        error: (error: Error) => {
          console.log(error);
          this.error.set(error.message)
        }
       }
    );

    this.destroyRef.onDestroy(() => subscription.unsubscribe);

  }


  onSelectPlace(selectedPlace: Place) {
    this.httpClient.put('http://localhost:3000/user-places', {placeId: selectedPlace.id}).subscribe(
      {next: (resData) => console.log(resData)}
    );

  }
}
