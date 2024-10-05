def bubble_sort(list_):
    n = len(list_)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if list_[j] > list_[j + 1]:
                list_[j], list_[j + 1] = list_[j + 1], list_[j]
                swapped = True
        if not swapped:
            break
