import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  private errorService = inject(ErrorService);

  private httpClient = inject(HttpClient);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'Something went wrong fetching the available places' )
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places', 'Something went wrong fetching the user places' )
    .pipe(tap({
      next: (userPlaces) => this.userPlaces.set(userPlaces)
    }))
  }

  addPlaceToUserPlaces(place: Place) {

    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.update((oldUserPlaces) => [...oldUserPlaces, place]);
    }

    return this.httpClient.put('http://localhost:3000/user-places', {placeId: place.id})
    .pipe(catchError((error) => {
      this.userPlaces.set(prevPlaces);
      this.errorService.showError('Updating user places went wrong');
      return throwError(() => new Error('Updating user places went wrong'))
    }));
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url)
    .pipe(map((restData) => restData.places), catchError((error) => throwError(() => new Error(errorMessage))))
    
  }
}
